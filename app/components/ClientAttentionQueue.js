'use client'

import { useState, useEffect } from 'react'
import styles from './attentionQueue.module.css'

export default function ClientAttentionQueue({ onClientClick }) {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
  fetchAttentionQueue()
  // Auto-refresh every 10 seconds (more responsive)
  const interval = setInterval(fetchAttentionQueue, 10000)
  return () => clearInterval(interval)
}, [])

// Refresh after user takes action
const handleClientClick = (client, tab) => {
  onClientClick?.(client, tab)
  // Refresh queue after user opens client
  setTimeout(() => {
    fetchAttentionQueue()
  }, 500)
}


  const fetchAttentionQueue = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/attention-queue', {
        headers: { 'Authorization': 'Bearer ' + token },
      })
      const data = await res.json()
      if (data.success) {
        setQueue(data.queue)
        setLastUpdated(new Date())
      }
    } catch (err) {
      console.error('Failed to fetch attention queue:', err)
    }
    setLoading(false)
  }

  const getUrgencyColor = (daysWaiting) => {
    if (daysWaiting >= 3) return '#ef4444' // Red
    if (daysWaiting >= 1) return '#f59e0b' // Amber
    return '#22c55e' // Green
  }

  const getUrgencyLabel = (daysWaiting) => {
    if (daysWaiting >= 3) return '🔴'
    if (daysWaiting >= 1) return '🟡'
    return '🟢'
  }

  const formatTimeAgo = (date) => {
    if (!date) return 'just now'
    const now = new Date()
    const seconds = Math.floor((now - new Date(date)) / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'just now'
  }

  const getProgressPercentage = (clientId, itemType) => {
    // This would require additional data - for now, we'll use a placeholder
    return Math.floor(Math.random() * 40) + 20
  }

  const handleQuickAction = (e, client, tab) => {
    e.stopPropagation()
    onClientClick?.(client, tab)
  }

  if (collapsed) {
    return (
      <div className={styles.collapsedWidget}>
        <button
          onClick={() => setCollapsed(false)}
          className={styles.expandBtn}
          title="Open Attention Queue"
        >
          <span className={styles.badge}>{queue.length}</span>
          🔔
        </button>
      </div>
    )
  }

  return (
    <div className={styles.sidebarWidget}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>🔔 Attention Queue</h3>
          <button
            onClick={() => setCollapsed(true)}
            className={styles.collapseBtn}
            title="Collapse"
          >
            −
          </button>
        </div>

        {/* Stats */}
        {!loading && queue.length > 0 && (
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>{queue.length} CLIENTS</span>
              <span className={styles.statValue}>{queue.length}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>TOTAL ITEMS</span>
              <span className={styles.statValue}>
                {queue.reduce((sum, item) => sum + item.photos.length + item.checkins.length + item.weightLogs.length, 0)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading...</p>
          </div>
        ) : queue.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>✨</p>
            <p className={styles.emptyText}>All caught up!</p>
            <p className={styles.emptySubtext}>No clients waiting for attention</p>
          </div>
        ) : (
          <div className={styles.queueList}>
            {queue.map((item) => {
              const totalItems = item.photos.length + item.checkins.length + item.weightLogs.length
              const urgencyColor = getUrgencyColor(item.urgencyScore)

              return (
                <div
                  key={item.client_id}
                  className={styles.queueItem}
                  style={{ borderLeftColor: urgencyColor }}
                >
                  {/* Client Header */}
                  <div className={styles.clientHeader}>
                    <div className={styles.clientInfo}>
                      <span className={styles.urgency}>
                        {getUrgencyLabel(item.urgencyScore)}
                      </span>
                      <div>
                        <p className={styles.clientName}>{item.client_name}</p>
                        <p className={styles.clientEmail}>{item.client_email}</p>
                      </div>
                    </div>
                    <span className={styles.itemCount}>{totalItems}</span>
                  </div>

                  {/* Items */}
                  <div className={styles.itemsList}>
                    {item.photos.length > 0 && (
                      <div className={styles.itemGroup}>
                        <p className={styles.itemLabel}>
                          📸 {item.photos.length} photo{item.photos.length > 1 ? 's' : ''}
                        </p>
                        <p className={styles.timeAgo}>
                          {formatTimeAgo(item.photos[0]?.created_at)}
                        </p>
                      </div>
                    )}

                    {item.checkins.length > 0 && (
                      <div className={styles.itemGroup}>
                        <p className={styles.itemLabel}>
                          📋 {item.checkins.length} check-in{item.checkins.length > 1 ? 's' : ''}
                        </p>
                        <p className={styles.timeAgo}>
                          {formatTimeAgo(item.checkins[0]?.created_at)}
                        </p>
                      </div>
                    )}

                    {item.weightLogs.length > 0 && (
                      <div className={styles.itemGroup}>
                        <p className={styles.itemLabel}>
                          ⚡ {item.weightLogs.length} weight log
                        </p>
                        <p className={styles.timeAgo}>
                          {formatTimeAgo(item.weightLogs[0]?.logged_at)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className={styles.actions}>
                    {item.photos.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onClientClick?.(item, 'photos')
                          setTimeout(() => {
                            fetchAttentionQueue()
                          }, 500)
                        }}
                        className={styles.actionBtn + ' ' + styles.photosBtn}
                      >
                        👁 Review
                      </button>
                    )}
                    {item.checkins.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onClientClick?.(item, 'checkins')
                          setTimeout(() => {
                            fetchAttentionQueue()
                          }, 500)
                        }}
                        className={styles.actionBtn + ' ' + styles.checkinsBtn}
                      >
                        💬 Reply
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onClientClick?.(item, 'info')
                        setTimeout(() => {
                          fetchAttentionQueue()
                        }, 500)
                      }}
                      className={styles.actionBtn + ' ' + styles.profileBtn}
                    >
                      → Profile
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>


      {/* Footer */}
      <div className={styles.footer}>
        <button
          onClick={fetchAttentionQueue}
          className={styles.refreshBtn}
        >
          🔄 Refresh
        </button>
        <p className={styles.lastUpdated}>
          Updated {lastUpdated ? formatTimeAgo(lastUpdated) : '...'}
        </p>
      </div>
    </div>
  )
}
