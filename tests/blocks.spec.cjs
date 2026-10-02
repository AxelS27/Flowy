const { test, expect, _electron: electron } = require('@playwright/test');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

let app, page, temp, originalClipboard;
const block = (action, param = '', secondaryParam) => ({
  id: action, action, type: 'utility', title: action, param, secondaryParam,
});
const run = (steps) => page.evaluate((steps) => window.electronAPI.executeRoutine({ id: 'e2e', steps }), steps);

test.describe.configure({ mode: 'serial' });
test.beforeAll(async () => {
  temp = await fs.mkdtemp(path.join(os.tmpdir(), 'flowy-e2e-'));
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  delete env.VITE_DEV_SERVER_URL;
  app = await electron.launch({ args: ['.', `--user-data-dir=${path.join(temp, 'profile')}`], env });
  page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(() => !!window.electronAPI);
  originalClipboard = await app.evaluate(({ clipboard }) => clipboard.readText());
});
test.afterAll(async () => {
  if (app) {
    await app.evaluate(({ clipboard }, text) => clipboard.writeText(text), originalClipboard || '');
    await app.close();
  }
  if (temp) await fs.rm(temp, { recursive: true, force: true });
});

test('real IPC creates, copies, renames and moves folders without overwriting', async () => {
  const source = path.join(temp, 'source');
  const copy = path.join(temp, 'copy');
  const moved = path.join(temp, 'moved');
  expect(await run([block('folder.create', source)])).toMatchObject({ success: true });
  await fs.writeFile(path.join(source, 'notes.txt'), 'hello');
  expect(await run([block('path.copy', source, copy)])).toMatchObject({ success: true });
  expect(await fs.readFile(path.join(copy, 'notes.txt'), 'utf8')).toBe('hello');
  const collision = await run([block('path.copy', source, copy)]);
  expect(collision.success).toBe(false);
  expect(collision.error).toContain('already exists');
  expect(await run([block('path.rename', path.join(copy, 'notes.txt'), 'renamed.txt'), block('path.move', copy, moved)])).toMatchObject({ success: true });
  expect(await fs.readFile(path.join(moved, 'renamed.txt'), 'utf8')).toBe('hello');
});

test('unsafe paths, URL protocols, invalid waits and unknown blocks fail truthfully', async () => {
  for (const step of [block('folder.create', 'relative/path'), block('web.open', 'file:///C:/Windows'),
    block('utility.wait', '-1'), block('utility.wait', 'Infinity'), block('utility.wait', ''),
    block('path.rename', path.join(temp, 'source'), '../escape'), block('no.such.action')]) {
    expect((await run([step])).success).toBe(false);
  }
  // Audio is now implemented. Never change the user's real volume in this suite.
  const invalidAudio = await run([{ id: 'old', type: 'audio', title: 'Set Volume', param: '101' }]);
  expect(invalidAudio.success).toBe(false);
  expect(invalidAudio.code).toBe('INVALID_PARAMETER');
});

test('real progress and clipboard execution stop after a failure', async () => {
  await page.evaluate(() => {
    window.progress = [];
    window.stopProgress = window.electronAPI.onStepProgress((event) => window.progress.push(event));
  });
  expect(await run([block('clipboard.copy', 'Flowy E2E'), block('utility.wait', '0.05')])).toMatchObject({ success: true });
  expect(await app.evaluate(({ clipboard }) => clipboard.readText())).toBe('Flowy E2E');
  expect(await page.evaluate(() => window.progress.map((event) => event.status))).toEqual(['running', 'completed', 'running', 'completed']);
  const result = await run([block('no.such.action'), block('clipboard.copy', 'must not execute')]);
  expect(result.stepIndex).toBe(0);
  expect(await app.evaluate(({ clipboard }) => clipboard.readText())).toBe('Flowy E2E');
  await page.evaluate(() => window.stopProgress());
});

test('Stop interrupts waits and rejects concurrent runs', async () => {
  await page.evaluate(() => {
    window.pendingRun = window.electronAPI.executeRoutine({ id: 'pending', steps: [{ id: 'wait', action: 'utility.wait', type: 'utility', title: 'Wait', param: '30' }] });
  });
  const busy = await run([block('clipboard.copy', 'must not execute')]);
  expect(busy.success).toBe(false);
  expect(busy.error).toContain('already running');
  const result = await page.evaluate(async () => {
    window.electronAPI.cancelRoutine();
    return window.pendingRun;
  });
  expect(result.success).toBe(false);
  expect(result.error).toContain('cancelled');
});

test('delete uses Recycle Bin and confirmation cancellation stops the routine', async () => {
  const target = path.join(temp, 'recycle-me.txt');
  await fs.writeFile(target, 'disposable E2E fixture');
  // Replace only the native dialog response. The actual IPC, filesystem and trash API remain real.
  await app.evaluate(({ dialog }) => {
    global.originalDialog = dialog.showMessageBox;
    global.confirmationMessages = [];
    dialog.showMessageBox = async (...args) => {
      const options = args[args.length - 1];
      global.confirmationMessages.push(options.message);
      return { response: 0 };
    };
  });
  expect((await run([block('file.delete', target)])).success).toBe(false);
  expect(await fs.readFile(target, 'utf8')).toBe('disposable E2E fixture');
  await app.evaluate(({ dialog }) => { dialog.showMessageBox = async () => ({ response: 1 }); });
  expect(await run([block('file.delete', target)])).toMatchObject({ success: true });
  await expect(fs.stat(target)).rejects.toThrow();
  await app.evaluate(({ dialog }) => { dialog.showMessageBox = global.originalDialog; });
});

test('editor searches, drags, configures, runs and persists a real folder block', async () => {
  await page.getByRole('button', { name: 'New routine' }).click();
  await page.getByPlaceholder(/routine name|Deep Focus|Work Mode|Morning/i).first().fill('E2E Folder');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  const search = page.getByPlaceholder('Search blocks...');
  await search.fill('no-such-block-e2e');
  await expect(page.getByRole('status')).toHaveText('No matching blocks.');
  await search.fill('Create Folder');
  const tile = page.locator('[title="Drag puzzle piece to pipeline"]').filter({ hasText: 'Create Folder' });
  const from = await tile.boundingBox();
  const board = page.getByText('Pipeline is Empty', { exact: true });
  const to = await board.boundingBox();
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 15 });
  await page.mouse.up();
  const target = path.join(temp, 'from-editor');
  await page.getByLabel('New folder path').fill(target);
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(page.getByText('Done', { exact: true })).toBeVisible();
  expect((await fs.stat(target)).isDirectory()).toBe(true);
  await page.screenshot({ path: 'test-results/editor.png' });
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('flowy_routines')).find((routine) => routine.name === 'E2E Folder'));
  expect(saved.steps[0].action).toBe('folder.create');
  expect(saved.steps[0].param).toBe(target);
});

test('Dynamic Island executes the saved routine rather than a timer simulation', async () => {
  const target = path.join(temp, 'from-island');
  const routine = { id: 'island-e2e', name: 'Island E2E', icon: '*', color: 'mint', triggers: ['test'], enabled: true,
    steps: [block('folder.create', target), block('utility.wait', '0.3')] };
  await page.evaluate((routine) => window.electronAPI.showIsland(routine), routine);
  await expect.poll(async () => {
    try { return (await fs.stat(target)).isDirectory(); } catch { return false; }
  }, { timeout: 10000 }).toBe(true);
  const windows = app.windows();
  const island = windows.find((window) => window !== page);
  await expect(island.getByText('Routine Completed!', { exact: true })).toBeVisible({ timeout: 10000 });
});

test('Dynamic Island displays failures without a success celebration', async () => {
  const routine = { id: 'island-failed', name: 'Unsupported E2E', icon: '*', color: 'mint', triggers: ['test'], enabled: true,
    steps: [block('not.implemented')] };
  await page.evaluate((routine) => window.electronAPI.showIsland(routine), routine);
  const island = app.windows().find((window) => window !== page);
  await expect(island.getByRole('alert')).toContainText('Unknown action', { timeout: 10000 });
  await expect(island.getByText('Routine Completed!', { exact: true })).not.toBeVisible();
  await island.getByRole('button', { name: 'Dismiss' }).click();
});
