import { atom, useAtom } from "jotai";

// Define a type for the monitoring task
type MonitoringTask = {
  targetTick: number;
  checker: () => Promise<boolean>;
  onSuccess: () => Promise<void>;
  onFailure: () => Promise<void>;
};

// Global state for active monitoring tasks
export const monitoringTasksAtom = atom<Record<string, MonitoringTask>>({});
export const isMonitoringAtom = atom<boolean>(false);
export const resultAtom = atom<boolean | undefined>(undefined);

export const useTxMonitor = () => {
  const [, setMonitoringTasks] = useAtom(monitoringTasksAtom);
  const [isMonitoring, setIsMonitoring] = useAtom(isMonitoringAtom);
  const [result, setResult] = useAtom(resultAtom);

  const startMonitoring = (taskId: string, task: MonitoringTask) => {
    setMonitoringTasks((prev) => ({ ...prev, [taskId]: task }));
    setIsMonitoring(true);
    setResult(undefined);
  };

  const stopMonitoring = (taskId: string) => {
    setMonitoringTasks((prev) => {
      const newTasks = { ...prev };
      delete newTasks[taskId];
      return newTasks;
    });
    setIsMonitoring(false);
  };

  const resetState = () => {
    setMonitoringTasks({});
    setIsMonitoring(false);
    setResult(undefined);
  };

  return {
    isMonitoring,
    result,
    startMonitoring,
    stopMonitoring,
    resetState,
  };
};
