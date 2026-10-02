import { useState, useEffect, useMemo } from "react";
import { Routine, RoutineCategory } from "../types";
import { initialRoutines } from "../data/mockRoutines";

const STORAGE_KEY = "flowy_routines";
const LEGACY_STORAGE_KEY = "voflow_routines";

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialRoutines;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
  }, [routines]);

  const filteredRoutines = useMemo(() => {
    return routines.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        !!r.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || r.category === (selectedCategory as RoutineCategory);

      return matchesSearch && matchesCategory;
    });
  }, [routines, searchQuery, selectedCategory]);

  const saveRoutine = (updated: Routine) => {
    setRoutines((prev) => {
      const exists = prev.some((r) => r.id === updated.id);
      if (exists) {
        return prev.map((r) => (r.id === updated.id ? updated : r));
      }
      return [updated, ...prev];
    });
  };

  const deleteRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleRoutine = (id: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const incrementStreak = (id: string) => {
    setRoutines((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              streakCount: (r.streakCount || 0) + 1,
              lastRun: new Date().toISOString(),
            }
          : r
      )
    );
  };

  return {
    routines,
    setRoutines,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredRoutines,
    saveRoutine,
    deleteRoutine,
    toggleRoutine,
    incrementStreak,
  };
}
