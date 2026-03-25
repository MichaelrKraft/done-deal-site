'use client'

import { useState } from 'react'
import TaskCard from '@/components/transactions/TaskCard'
import type { Task as TaskType, AIAction, TaskNoteRow } from '@/types/database'

interface TaskListProps {
  tasks: TaskType[]
  aiActions: AIAction[]
  transactionId: string
  initialNotes?: TaskNoteRow[]
}

export default function TaskList({ tasks, aiActions, transactionId, initialNotes }: TaskListProps) {
  const [localTasks, setLocalTasks] = useState<TaskType[]>(tasks)
  const [localNotes, setLocalNotes] = useState<TaskNoteRow[]>(initialNotes ?? [])
  const [error, setError] = useState<string | null>(null)

  // Filter AI actions relevant to a task by matching title keywords in context_summary
  function actionsForTask(task: TaskType): AIAction[] {
    const keywords = task.title.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    return aiActions.filter(a => {
      const summary = (a.context_summary ?? a.action_type).toLowerCase()
      return keywords.some(kw => summary.includes(kw))
    })
  }

  const tasksByStatus = {
    active: localTasks.filter(t => t.status === 'pending' || t.status === 'in_progress'),
    done: localTasks.filter(t => t.status === 'completed' || t.status === 'skipped' || t.status === 'n_a'),
  }

  async function handleStatusChange(taskId: string, newStatus: string) {
    setError(null)

    // Save previous state for rollback
    const previousTasks = localTasks

    // Optimistic update
    setLocalTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus as TaskType['status'],
              completed_by: newStatus === 'completed' ? 'optimistic' : null,
              completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
              completion_method: newStatus === 'completed' ? 'manual' as const : null,
            }
          : t
      )
    )

    try {
      const res = await fetch(`/api/transactions/${transactionId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to update task')
      }

      // Replace optimistic data with server response
      const updated = await res.json() as TaskType
      setLocalTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)))
    } catch (err) {
      // Revert on error
      setLocalTasks(previousTasks)
      setError(err instanceof Error ? err.message : 'Failed to update task')
    }
  }

  function notesForTask(taskId: string): TaskNoteRow[] {
    return localNotes.filter(n => n.task_id === taskId)
  }

  async function handleAddNote(taskId: string, content: string) {
    setError(null)

    // Optimistic note
    const optimisticNote: TaskNoteRow = {
      id: `optimistic-${Date.now()}`,
      task_id: taskId,
      author_type: 'agent',
      author_id: null,
      content,
      created_at: new Date().toISOString(),
    }

    const previousNotes = localNotes
    setLocalNotes(prev => [optimisticNote, ...prev])

    try {
      const res = await fetch(`/api/transactions/${transactionId}/tasks/${taskId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to add note')
      }

      const created = await res.json() as TaskNoteRow
      setLocalNotes(prev => prev.map(n => n.id === optimisticNote.id ? created : n))
    } catch (err) {
      setLocalNotes(previousNotes)
      setError(err instanceof Error ? err.message : 'Failed to add note')
    }
  }

  return (
    <>
      {error && (
        <div className="px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {tasksByStatus.active.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#b0a698] uppercase tracking-wider mb-3">
            Active Tasks ({tasksByStatus.active.length})
          </h2>
          <div className="space-y-2">
            {tasksByStatus.active.map(t => (
              <TaskCard
                key={t.id}
                task={t}
                aiActions={actionsForTask(t)}
                notes={notesForTask(t.id)}
                onStatusChange={handleStatusChange}
                onAddNote={handleAddNote}
              />
            ))}
          </div>
        </div>
      )}

      {tasksByStatus.done.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#b0a698] uppercase tracking-wider mb-3">
            Completed ({tasksByStatus.done.length})
          </h2>
          <div className="space-y-2">
            {tasksByStatus.done.map(t => (
              <TaskCard
                key={t.id}
                task={t}
                aiActions={actionsForTask(t)}
                notes={notesForTask(t.id)}
                onStatusChange={handleStatusChange}
                onAddNote={handleAddNote}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
