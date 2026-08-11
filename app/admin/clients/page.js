'use client'

import ClientSubscriptionCard from '@/app/components/ClientSubscriptionCard';
import MyRewardsTab from '@/app/components/MyRewardsTab';
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import styles from './clients.module.css'
import PlanEditorModal from '@/app/dashboard/components/PlanEditorModal'
import ReferralManagementTab from '@/app/components/ReferralManagementTab'
import ClientAttentionQueue from '@/app/components/ClientAttentionQueue'

const QUICK_REPLIES = [
  "Great progress this week! Keep pushing! 💪",
  "Looking strong! Stay consistent and results will keep coming.",
  "Solid effort — your hard work is showing. Don't stop now!",
  "Love the dedication! You're on the right track.",
  "Keep going — every week counts. You've got this!",
  "Big improvements! Trust the process and stay locked in.",
]

export default function AdminClientsPage() {
  const router = useRouter()
  const referralTabRef = useRef(null)
  
  // Client list states
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlan, setFilterPlan] = useState('all')
  const [filterSubStatus, setFilterSubStatus] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSubPlan, setFilterSubPlan] = useState('all')
  const [loadingClient, setLoadingClient] = useState(null) // ← THIS NOW INSIDE COMPONENT
  const [stats, setStats] = useState({
    pendingApproval: 0,
    approvedClients: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
  })

  // ... rest of your code continues from here


  // Modal and client detail states
  const [selectedClient, setSelectedClient] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalTab, setModalTab] = useState('info')

  // Macro states
  const [macroData, setMacroData] = useState(null)
  const [macroLoading, setMacroLoading] = useState(false)
  const [macroError, setMacroError] = useState('')
  const [showMacroModal, setShowMacroModal] = useState(false)

  // Meal plan states
  const [mealPlanData, setMealPlanData] = useState(null)
  const [mealPlanLoading, setMealPlanLoading] = useState(false)
  const [planHistory, setPlanHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [expandedMealId, setExpandedMealId] = useState(null)
  const [showPlanEditor, setShowPlanEditor] = useState(false)

  // Plan action states
  const [regeneratingId, setRegeneratingId] = useState(null)
  const [approvingId, setApprovingId] = useState(null)
  const [resendingId, setResendingId] = useState(null)

  // Check-in states
  const [clientCheckins, setClientCheckins] = useState([])
  const [replyText, setReplyText] = useState({})
  const [sendingReply, setSendingReply] = useState(null)
  const [selectedCheckinForEdit, setSelectedCheckinForEdit] = useState(null)

  // Weight tracking states
  const [clientWeightLogs, setClientWeightLogs] = useState([])
  const [clientWeightCorrections, setClientWeightCorrections] = useState([])
  const [approvingCorrection, setApprovingCorrection] = useState(null)
  const [denyingCorrection, setDenyingCorrection] = useState(null)

  // Photo states
  const [clientPhotos, setClientPhotos] = useState([])
  const [photosLoading, setPhotosLoading] = useState(false)
  const [photoFeedback, setPhotoFeedback] = useState({})
  const [savingFeedback, setSavingFeedback] = useState(null)
  const [deletingPhoto, setDeletingPhoto] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [unreviewedPhotos, setUnreviewedPhotos] = useState(0)

  // Coaching notes states
  const [coachingNotes, setCoachingNotes] = useState('')
  const [notesLoading, setNotesLoading] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchClients()
    fetchUnreviewedPhotos()
  }, [router])

  const fetchUnreviewedPhotos = async () => {
    try {
      const res = await fetch('/api/admin/photos?filter=unreviewed')
      const data = await res.json()
      setUnreviewedPhotos(data.unreviewedCount || 0)
    } catch (err) {
      console.error('Failed to fetch unreviewed photos:', err)
    }
  }

  const fetchClients = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        return
      }
      const response = await fetch('/api/admin/clients', {
        headers: { 'Authorization': 'Bearer ' + token },
      })
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken')
          router.push('/admin/login')
          return
        }
        throw new Error(`Failed to fetch: ${response.status}`)
      }
      const data = await response.json()
      if (!data.clients || !Array.isArray(data.clients)) {
        console.error('Invalid response format:', data)
        setClients([])
      } else {
        setClients(data.clients)
        calculateStats(data.clients)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
      alert('Failed to load clients: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (clientList) => {
    // Pending: payment complete but plan not approved yet
    const pending = clientList.filter(c => 
      c.payment_status === 'completed' && !c.plan_approved_at
    )
    
    // Approved: payment complete and plan approved
    const approved = clientList.filter(c => 
      c.payment_status === 'completed' && c.plan_approved_at
    )
    
    // Active subscriptions: anyone with completed payment (currently active)
    const subscriptions = clientList.filter(c => c.payment_status === 'completed')
    
    // Revenue calculation
    let revenue = 0
    clientList.forEach(c => {
      if (c.plan_type === 'pro') revenue += 127
      if (c.plan_type === 'elite') revenue += 197
      if (c.plan_type === 'kickstart' || c.plan_type === 'kickstart') revenue += 67
    })
    
    setStats({
      pendingApproval: pending.length,
      approvedClients: approved.length,
      totalRevenue: revenue,
      activeSubscriptions: subscriptions.length,
    })
  }

  const formatHeight = (client) => {
    const inches = parseInt(client.height) || null
    if (!inches) return 'N/A'
    const feet = Math.floor(inches / 12)
    const remainingInches = inches % 12
    return feet + "'" + remainingInches + '"'
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminEmail')
    router.push('/admin/login')
  }

  const fetchClientPhotos = async (clientId) => {
    setPhotosLoading(true)
    setClientPhotos([])
    try {
      const res = await fetch('/api/admin/photos?filter=all')
      const data = await res.json()
      const filtered = (data.photos || []).filter(p => p.client_id === clientId)
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      setClientPhotos(filtered)
      const feedbackMap = {}
      filtered.forEach(p => {
        if (p.dane_feedback) feedbackMap[p.id] = p.dane_feedback
      })
      setPhotoFeedback(feedbackMap)
    } catch (err) {
      console.error('Error fetching client photos:', err)
    }
    setPhotosLoading(false)
  }

  // ── FIX #1: PREVENT DOUBLE-CLICK BUG ──────────────────────────
  const openClientDetails = async (client) => {
  // Prevent double-click while loading
  if (loadingClient === client.id) return
  setLoadingClient(client.id)

  // Reset modal state FIRST before changing client
  setShowModal(false) // Close existing modal
  
  // Wait a tick for modal to close
  await new Promise(r => setTimeout(r, 100))

  // NOW set the new client and open
  setSelectedClient(client)
  setShowModal(true)

  // Reset all data states
  setModalTab('info')
  setMacroLoading(true)
  setMealPlanLoading(true)
  setHistoryLoading(true)
  setMacroError('')
  setMacroData(null)
  setMealPlanData(null)
  setPlanHistory([])
  setClientCheckins([])
  setClientWeightLogs([])
  setClientPhotos([])
  setClientWeightCorrections([])
  setPhotoFeedback({})
  setReplyText({})
  setSendingReply(null)
  setSelectedCheckinForEdit(null)
  setApprovingCorrection(null)
  setDenyingCorrection(null)

  try {
    // Fetch macros from macro_targets table
    try {
      const macroResponse = await fetch('/api/admin/client-macros/' + client.id)
      if (macroResponse.ok) {
        const macroContent = await macroResponse.json()
        setMacroData(macroContent.macros)
      } else {
        setMacroError('No macro data available')
      }
    } catch (error) {
      setMacroError(error.message || 'Failed to load macros')
    } finally {
      setMacroLoading(false)
    }

    // Fetch meal plan
    try {
      const mealResponse = await fetch('/api/admin/client-meal-plan/' + client.id)
      if (mealResponse.ok) {
        const mealContent = await mealResponse.json()
        setMealPlanData(mealContent.mealPlan)
      }
    } catch (error) {
      console.error('Error fetching meal plan:', error)
    } finally {
      setMealPlanLoading(false)
    }

    // Fetch plan history
    try {
      const historyResponse = await fetch('/api/admin/plan-history/' + client.id)
      if (historyResponse.ok) {
        const historyContent = await historyResponse.json()
        setPlanHistory(historyContent.history || [])
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setHistoryLoading(false)
    }

    // Fetch check-ins and weight logs
    try {
      const progressResponse = await fetch('/api/clients/get-progress?clientId=' + client.id)
      if (progressResponse.ok) {
        const progressData = await progressResponse.json()
        setClientCheckins(progressData.checkIns || progressData.checkins || [])
        setClientWeightLogs(progressData.weightLogs || [])
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
    }

    // Fetch weight corrections
    try {
      const res = await fetch('/api/admin/weight-corrections/' + client.id)
      if (res.ok) {
        const data = await res.json()
        setClientWeightCorrections(data.corrections || [])
      }
    } catch (error) {
      console.error('Error fetching weight corrections:', error)
    }

    // Fetch photos
    try {
      await fetchClientPhotos(client.id)
    } catch (error) {
      console.error('Error fetching photos:', error)
    }

    // Fetch referral stats for this client
    try {
      const refResponse = await fetch('/api/admin/referrals')
      if (refResponse.ok) {
        const refData = await refResponse.json()
        const clientReferrals = (refData.referrals || []).filter(
          r => r.referrer_client_id === client.id
        )
        const completedCount = clientReferrals.filter(r => r.status === 'completed').length
        const pendingCount = clientReferrals.filter(r => r.status === 'pending').length
        
        // Update selectedClient with referral data
        setSelectedClient(prev => ({
          ...prev,
          referrals_made_count: clientReferrals.length,
          referrals_completed_count: completedCount,
          referrals_pending_count: pendingCount,
        }))
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error)
    }
  } finally {
    setLoadingClient(null)
  }
}


  const handleModalTabChange = (key) => {
    setModalTab(key)
    if (key === 'photos' && selectedClient) {
      fetchClientPhotos(selectedClient.id)
    }
  }

  const handleSaveFeedback = async (photoId) => {
    const feedback = photoFeedback[photoId]?.trim()
    if (!feedback) return
    setSavingFeedback(photoId)
    try {
      const res = await fetch('/api/admin/respond-to-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, feedback }),
      })
      const data = await res.json()
      if (data.success) {
        setClientPhotos(prev =>
          prev.map(p =>
            p.id === photoId ? { ...p, dane_feedback: feedback } : p
          )
        )
        fetchUnreviewedPhotos()
      }
    } catch (err) {
      console.error(err)
    }
    setSavingFeedback(null)
  }

  const handleDeletePhoto = async (photoId) => {
    setDeletingPhoto(photoId)
    try {
      const res = await fetch('/api/admin/delete-photo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId }),
      })
      const data = await res.json()
      if (data.success) {
        setClientPhotos(prev => prev.filter(p => p.id !== photoId))
        fetchUnreviewedPhotos()
      }
    } catch (err) {
      console.error(err)
    }
    setDeletingPhoto(null)
    setShowDeleteConfirm(null)
  }

  const handleApproveWeightCorrection = async (correction) => {
    setApprovingCorrection(correction.id)
    try {
      const res = await fetch('/api/admin/approve-weight-correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correctionId: correction.id }),
      })
      const data = await res.json()
      if (data.success) {
        alert('Weight correction approved!')
        setClientWeightCorrections(prev => prev.filter(c => c.id !== correction.id))
      } else {
        alert('Failed: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error approving correction:', error)
      alert('Failed to approve correction: ' + error.message)
    } finally {
      setApprovingCorrection(null)
    }
  }

  const handleDenyWeightCorrection = async (correction) => {
    setDenyingCorrection(correction.id)
    try {
      const res = await fetch('/api/admin/deny-weight-correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correctionId: correction.id }),
      })
      const data = await res.json()
      if (data.success) {
        alert('Weight correction denied.')
        setClientWeightCorrections(prev => prev.filter(c => c.id !== correction.id))
      } else {
        alert('Failed: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error denying correction:', error)
      alert('Failed to deny correction: ' + error.message)
    } finally {
      setDenyingCorrection(null)
    }
  }

  const handleApprovePlan = async (clientId) => {
    if (!window.confirm('Approve this meal plan and send to client?')) return
    setApprovingId(clientId)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/approve-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ clientId }),
      })
      if (!response.ok) throw new Error('Failed to approve plan')
      alert('Plan approved! Magic link sent to client.')
      setShowModal(false)
      fetchClients()
    } catch (error) {
      alert('Failed to approve plan: ' + error.message)
    } finally {
      setApprovingId(null)
    }
  }

  const handleResendPlan = async (clientId) => {
    if (!window.confirm('Resend the meal plan access link to this client?')) return
    setResendingId(clientId)
    try {
      const response = await fetch('/api/admin/resend-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      })
      if (!response.ok) throw new Error('Failed to resend plan')
      alert('Access link resent to client!')
    } catch (error) {
      alert('Failed to resend plan: ' + error.message)
    } finally {
      setResendingId(null)
    }
  }

  const handleSaveCoachingNotes = async () => {
    if (!selectedClient) return
    try {
      setNotesLoading(true)
      const response = await fetch('/api/admin/update-coaching-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: selectedClient.id, notes: coachingNotes }),
      })
      if (!response.ok) throw new Error('Failed to update notes')
      alert('Coaching notes saved!')
      setShowNotesModal(false)
      setSelectedClient({ ...selectedClient, admin_notes: coachingNotes })
    } catch (error) {
      alert('Failed to save notes: ' + error.message)
    } finally {
      setNotesLoading(false)
    }
  }

  const handleRegenerateMealPlan = async (clientId) => {
    console.log('🔄 REGENERATE CLICKED FOR:', clientId)
    if (!window.confirm('Regenerate meal plan for this client? This will recalculate macros based on their intake data.')) return
    setRegeneratingId(clientId)
    try {
      const client = clients.find(c => c.id === clientId)
      let selectedFoods = []
      if (client.selected_foods) {
        try {
          selectedFoods = typeof client.selected_foods === 'string'
            ? JSON.parse(client.selected_foods)
            : client.selected_foods
        } catch (e) {
          selectedFoods = []
        }
      }
      
      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          clientData: {
            fullName:      client.full_name,
            email:         client.email,
            currentWeight: parseInt(client.current_weight) || 0,
            height:        parseInt(client.height) || 0,
            age:           parseInt(client.age) || 0,
            gender:        client.gender || 'male',
            primaryGoal:   client.primary_goal,
            activityLevel: client.activity_level,
            selectedFoods: selectedFoods,
            mealsPerDay:   parseInt(client.meals_per_day) || 3,
            mealPattern:   client.meal_pattern || 'balanced',
            dietaryType:   client.dietary_restrictions || 'omnivore',
            allergies: (() => {
              try {
                return typeof client.allergies === 'string'
                  ? JSON.parse(client.allergies)
                  : client.allergies || []
              } catch (e) { return [] }
            })(),
          },
          planType: client.plan_type,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to regenerate meal plan')
      }
      
      alert('Meal plan regenerated with fresh macros!')
      setShowModal(false)
      fetchClients()
    } catch (error) {
      alert('Failed to regenerate meal plan: ' + error.message)
    } finally {
      setRegeneratingId(null)
    }
  }

  const handleSendReply = async (checkIn) => {
    const reply = replyText[checkIn.id]?.trim()
    if (!reply) return
    setSendingReply(checkIn.id)
    try {
      const res = await fetch('/api/admin/respond-to-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkinId: checkIn.id,
          clientId:  selectedClient.id,
          response:  reply,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setClientCheckins(prev => prev.map(c =>
          c.id === checkIn.id
            ? { ...c, admin_response: reply, admin_responded_at: new Date().toISOString() }
            : c
        ))
        setReplyText(prev => ({ ...prev, [checkIn.id]: '' }))
        alert('Response sent to ' + (selectedClient.full_name?.split(' ')[0] || 'client') + '!')
      } else {
        alert('Failed to send reply: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      alert('Failed to send reply')
    } finally {
      setSendingReply(null)
    }
  }

  const calculateTotalCalories = (protein, carbs, fats) => {
    return (protein * 4) + (carbs * 4) + (fats * 9)
  }

  const handleSaveMacros = async () => {
  if (!selectedClient || !macroData) return
  
  // Validate macros
  if (macroData.daily_protein_g < 50 || macroData.daily_protein_g > 500) {
    alert('Protein should be between 50-500g')
    return
  }
  if (macroData.daily_carbs_g < 50 || macroData.daily_carbs_g > 600) {
    alert('Carbs should be between 50-600g')
    return
  }
  if (macroData.daily_fats_g < 20 || macroData.daily_fats_g > 200) {
    alert('Fats should be between 20-200g')
    return
  }
  
  const calculatedCalories = (macroData.daily_protein_g * 4) + (macroData.daily_carbs_g * 4) + (macroData.daily_fats_g * 9)
  
  if (calculatedCalories < 1200 || calculatedCalories > 5000) {
    alert(`Total calories (${calculatedCalories}) seem unrealistic. Please review.`)
    return
  }
  
  try {
    const response = await fetch('/api/admin/update-macros/' + selectedClient.id, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        daily_calories: calculatedCalories,
        daily_protein_g: macroData.daily_protein_g,
        daily_carbs_g: macroData.daily_carbs_g,
        daily_fats_g: macroData.daily_fats_g,
      }),
    })
    if (!response.ok) throw new Error('Failed to update macros')
    
    // ✅ UPDATE STATE IMMEDIATELY - Don't wait for re-click
    setMacroData({
      ...macroData,
      daily_calories: calculatedCalories,
    })
    
    alert('✅ Macros updated successfully!')
    setShowMacroModal(false)
  } catch (error) {
    alert('Failed to update macros: ' + error.message)
  }
}


  const getMealsFromPlanData = () => {
    if (!mealPlanData) return []
    const mealsData = mealPlanData.meals_data || mealPlanData
    const mealsObj  = (mealsData && mealsData.meals) ? mealsData.meals : mealsData
    if (!mealsObj || typeof mealsObj !== 'object' || Array.isArray(mealsObj)) return []
    return Object.entries(mealsObj)
      .filter(([key]) => key.startsWith('Meal'))
      .sort((a, b) => parseInt(a[0].match(/\d+/)[0]) - parseInt(b[0].match(/\d+/)[0]))
      .map(([name, data]) => ({ name, foods: data.foods || [], totals: data.totals || {} }))
  }

  const formatAllergies = (client) => {
    if (!client.allergies) return 'None'
    try {
      const parsed = typeof client.allergies === 'string'
        ? JSON.parse(client.allergies)
        : client.allergies
      return Array.isArray(parsed) && parsed.length > 0 ? parsed.join(', ') : 'None'
    } catch (e) {
      return client.allergies || 'None'
    }
  }

  // ── FIX #2 & #3: CALCULATE FILTERED CLIENTS ──────────────────────
  const pendingClients  = clients.filter(c => c.payment_status === 'completed' && !c.plan_approved_at)
  const approvedClients = clients.filter(c => c.payment_status === 'completed' && c.plan_approved_at)

  let filteredClients = activeTab === 'pending' ? pendingClients : approvedClients
  
  // Add status filter for approved clients
  if (activeTab === 'approved') {
    filteredClients = filteredClients.filter(c => {
      if (filterSubStatus === 'all') return true
      return c.subscription_status === filterSubStatus
    })
  }

  // Apply search and plan filters
  filteredClients = filteredClients.filter(client => {
    const matchesSearch =
      client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlan = filterPlan === 'all' || client.plan_type === filterPlan
    return matchesSearch && matchesPlan
  })

  // Calculate filtered subscription clients
  const filteredSubscriptionClients = clients.filter(c => {
    const matchesStatus = filterStatus === 'all' || c.subscription_status === filterStatus
    const matchesPlan = filterSubPlan === 'all' || c.plan_type === filterSubPlan
    const matchesSearch =
      searchTerm === '' ||
      c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesPlan && matchesSearch
  })

  if (loading) {
    return (
      <main className={styles.mainContainer}>
        <div className={styles.loadingCenter}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading dashboard...</p>
        </div>
      </main>
    )
  }

  const mealsArray = getMealsFromPlanData()

  return (
    <main className={styles.mainContainer}>
      <style>{`
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-3px); }
    }
    
    @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    @keyframes pulse-glow {
      0%, 100% { 
        opacity: 1;
        transform: scale(1);
      }
      50% { 
        opacity: 0.8;
        transform: scale(1.1);
      }
    }
  `}</style>

      <div className={styles.maxWidth}>

        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>BuildABod Command Center</h1>
            <p className={styles.subtitle}>Manage clients, approve plans, and track progress</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {unreviewedPhotos > 0 && (
  <button
    onClick={() => {
      setActiveTab('approved')
      setFilterSubStatus('all')
    }}
    style={{

                  display: 'flex', alignItems: 'center', gap: '6px',
                  backgroundColor: '#FFD70015', border: '1px solid #FFD700',
                  borderRadius: '999px', padding: '6px 14px',
                  fontSize: '12px', color: '#FFD700', fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFD70025';
                  e.currentTarget.style.borderColor = '#FFC107';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFD70015';
                  e.currentTarget.style.borderColor = '#FFD700';
                }}
              >
                📸
                <span style={{
                  backgroundColor: '#ef4444', color: '#fff',
                  fontSize: '10px', fontWeight: 'bold',
                  borderRadius: '999px', padding: '1px 6px',
                }}>
                  {unreviewedPhotos} new photo{unreviewedPhotos > 1 ? 's' : ''}
                </span>
              </button>
            )}
            <button 
              onClick={() => {
                fetchClients()
                fetchUnreviewedPhotos()
                referralTabRef.current?.fetchReferrals()
              }}
              style={{
                padding: '8px 14px',
                backgroundColor: '#4CAF50',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                           onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
            >
              🔄 Refresh
            </button>
            <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
          </div>
        </div>

                {/* ─── NEEDS ATTENTION ALERT SECTION ─── */}
{(unreviewedPhotos > 0) && (
  <div style={{
    background: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,100,100,0.06))',
    border: '2px solid #FFD700',
    borderRadius: '14px',
    padding: '24px',
    marginBottom: '24px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }}
  onClick={() => {
  console.log('🔔 NEEDS ATTENTION CLICKED')
  console.log('Current activeTab:', activeTab)
  console.log('Current filterSubStatus:', filterSubStatus)
  setActiveTab('approved')
  setFilterSubStatus('all')
  console.log('After state update - activeTab should be: approved')
  console.log('After state update - filterSubStatus should be: all')
}}

  onMouseEnter={e => {


            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,100,100,0.1))';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,100,100,0.06))';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px' }}>🔔</span>
              <h2 style={{ color: '#FFD700', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                Needs Your Attention
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  background: 'rgba(255,215,0,0.1)',
                  border: '1px solid #FFD700',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>📸</span>
                  <div>
                    <p style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '14px', margin: 0 }}>
                      {unreviewedPhotos} Photo{unreviewedPhotos > 1 ? 's' : ''} Need Review
                    </p>
                    <p style={{ color: '#888', fontSize: '12px', margin: '2px 0 0' }}>
                      Clients waiting for your feedback
                    </p>
                  </div>
                </div>
                <span style={{ color: '#FFD700', fontSize: '18px', fontWeight: 'bold' }}>→</span>
              </div>
            </div>
          </div>
        )}


                {/* STATS — CLICKABLE */}
        <div className={styles.statsGrid}>
          <div 
            className={styles.statCard}
            onClick={() => setActiveTab('pending')}
            style={{ 
              cursor: 'pointer', 
              transition: 'all 0.2s',
              border: activeTab === 'pending' ? '2px solid #FF6B35' : '2px solid transparent',
              transform: activeTab === 'pending' ? 'scale(1.03)' : 'scale(1)',
            }}
            onMouseEnter={e => { if (activeTab !== 'pending') e.currentTarget.style.transform = 'scale(1.02)' }}
            onMouseLeave={e => { if (activeTab !== 'pending') e.currentTarget.style.transform = 'scale(1)' }}
          >
            <div className={styles.statIcon}>⏳</div>
            <p className={styles.statLabel}>Pending Approval</p>
            <p className={styles.statValue} style={{ color: '#FF6B35' }}>{stats.pendingApproval}</p>
          </div>
          <div 
            className={styles.statCard}
            onClick={() => setActiveTab('approved')}
            style={{ 
              cursor: 'pointer', 
              transition: 'all 0.2s',
              border: activeTab === 'approved' ? '2px solid #4CAF50' : '2px solid transparent',
              transform: activeTab === 'approved' ? 'scale(1.03)' : 'scale(1)',
            }}
            onMouseEnter={e => { if (activeTab !== 'approved') e.currentTarget.style.transform = 'scale(1.02)' }}
            onMouseLeave={e => { if (activeTab !== 'approved') e.currentTarget.style.transform = 'scale(1)' }}
          >
            <div className={styles.statIcon}>✅</div>
            <p className={styles.statLabel}>Active Clients</p>
            <p className={styles.statValue} style={{ color: '#4CAF50' }}>{stats.approvedClients}</p>
          </div>
          <div 
            className={styles.statCard}
            onClick={() => setActiveTab('subscriptions')}
            style={{ 
              cursor: 'pointer', 
              transition: 'all 0.2s',
              border: activeTab === 'subscriptions' ? '2px solid #2196F3' : '2px solid transparent',
              transform: activeTab === 'subscriptions' ? 'scale(1.03)' : 'scale(1)',
            }}
            onMouseEnter={e => { if (activeTab !== 'subscriptions') e.currentTarget.style.transform = 'scale(1.02)' }}
            onMouseLeave={e => { if (activeTab !== 'subscriptions') e.currentTarget.style.transform = 'scale(1)' }}
          >
            <div className={styles.statIcon}>💪</div>
            <p className={styles.statLabel}>Subscriptions</p>
            <p className={styles.statValue} style={{ color: '#2196F3' }}>{stats.activeSubscriptions}</p>
          </div>
          <div 
            className={styles.statCard}
            onClick={() => setActiveTab('subscriptions')}
            style={{ 
              cursor: 'pointer', 
              transition: 'all 0.2s',
              border: activeTab === 'subscriptions' ? '2px solid #FFD700' : '2px solid transparent',
              transform: activeTab === 'subscriptions' ? 'scale(1.03)' : 'scale(1)',
            }}
            onMouseEnter={e => { if (activeTab !== 'subscriptions') e.currentTarget.style.transform = 'scale(1.02)' }}
            onMouseLeave={e => { if (activeTab !== 'subscriptions') e.currentTarget.style.transform = 'scale(1)' }}
          >
            <div className={styles.statIcon}>💰</div>
            <p className={styles.statLabel}>Total Revenue</p>
            <p className={styles.statValue} style={{ color: '#FFD700' }}>${stats.totalRevenue}</p>
          </div>
        </div>


        {/* TABS */}
        <div className={styles.tabContainer}>
          <button
            className={styles.tab + ' ' + (activeTab === 'pending' ? styles.activeTab : '')}
            onClick={() => setActiveTab('pending')}
          >
            <span className={styles.tabIcon}>⏳</span>
            Pending Approval ({stats.pendingApproval})
          </button>
          <button
            className={styles.tab + ' ' + (activeTab === 'approved' ? styles.activeTab : '')}
            onClick={() => setActiveTab('approved')}
          >
            <span className={styles.tabIcon}>✅</span>
            Active Clients ({stats.approvedClients})
          </button>
          <button
            className={styles.tab + ' ' + (activeTab === 'referrals' ? styles.activeTab : '')}
            onClick={() => setActiveTab('referrals')}
          >
            <span className={styles.tabIcon}>🎁</span>
            Referrals
          </button>
          <button
            className={styles.tab + ' ' + (activeTab === 'subscriptions' ? styles.activeTab : '')}
            onClick={() => setActiveTab('subscriptions')}
          >
            <span className={styles.tabIcon}>🔒</span>
            Subscriptions
          </button>
        </div>

        {/* SEARCH & FILTER FOR PENDING/APPROVED TABS */}
        {activeTab !== 'referrals' && activeTab !== 'subscriptions' && (
          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Plans</option>
              <option value="kickstart">Kickstart</option>
              <option value="pro">Pro</option>
              <option value="elite">Elite</option>
            </select>

            {/* FIX #3: STATUS FILTER FOR APPROVED CLIENTS */}
            {activeTab === 'approved' && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['all', 'active', 'paused', 'past_due', 'canceled'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterSubStatus(status)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      border: filterSubStatus === status ? `2px solid #FFD700` : '1px solid #333',
                      background: filterSubStatus === status ? 'rgba(255,215,0,0.1)' : '#222',
                      color: filterSubStatus === status ? '#FFD700' : '#888',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {status === 'all' && '📋 All'}
                    {status === 'active' && '✅ Active'}
                    {status === 'paused' && '⏸️ Paused'}
                    {status === 'past_due' && '⚠️ Past Due'}
                    {status === 'canceled' && '❌ Canceled'}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REFERRALS TAB CONTENT */}
        {activeTab === 'referrals' && (
          <ReferralManagementTab ref={referralTabRef} />
        )}

        {/* SUBSCRIPTIONS TAB CONTENT */}
        {activeTab === 'subscriptions' && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <h2 style={{ color: '#FFD700', fontSize: '20px', fontWeight: 'bold', margin: '0', flex: '1 0 100%' }}>
                💰 Subscription Management
              </h2>
              
              {/* SEARCH BOX */}
              <div className={styles.searchBox} style={{ flex: '1 0 auto', minWidth: '200px' }}>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              {/* STATUS FILTER */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['all', 'active', 'paused', 'past_due', 'canceled'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterStatus(filter)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      border: filterStatus === filter ? `2px solid #FFD700` : '1px solid #333',
                      background: filterStatus === filter ? 'rgba(255,215,0,0.1)' : '#222',
                      color: filterStatus === filter ? '#FFD700' : '#888',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {filter === 'all' && '📋 All'}
                    {filter === 'active' && '✅ Active'}
                    {filter === 'paused' && '⏸️ Paused'}
                    {filter === 'past_due' && '⚠️ Past Due'}
                    {filter === 'canceled' && '❌ Canceled'}
                  </button>
                ))}
              </div>

              {/* PLAN FILTER */}
              <select
                value={filterSubPlan}
                onChange={(e) => setFilterSubPlan(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  border: '1px solid #333',
                  background: '#222',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Plans</option>
                <option value="kickstart">Kickstart</option>
                <option value="pro">Pro</option>
                <option value="elite">Elite</option>
              </select>
            </div>

            {loading ? (
              <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Loading clients...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredSubscriptionClients.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <p style={{ fontSize: '14px' }}>No subscriptions match your filters</p>
                  </div>
                ) : (
                  <>
                    <p style={{ color: '#666', fontSize: '12px', marginBottom: '0' }}>
                      Showing {filteredSubscriptionClients.length} subscription{filteredSubscriptionClients.length !== 1 ? 's' : ''}
                    </p>
                    {filteredSubscriptionClients.map((client) => (
                      <ClientSubscriptionCard
                        key={client.id}
                        client={client}
                        onActionComplete={() => {
                          fetchClients();
                        }}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* CLIENT LIST FOR PENDING/APPROVED TABS */}
        {activeTab !== 'referrals' && activeTab !== 'subscriptions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredClients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: '48px', margin: '0 0 12px' }}>📭</p>
                <p style={{ color: '#888', fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px' }}>
                  {activeTab === 'pending' ? 'No pending plans waiting for approval' : 'No active clients found'}
                </p>
                <p style={{ color: '#555', fontSize: '12px', margin: 0 }}>
                  {searchTerm ? 'Try a different search term' : 'New clients will appear here'}
                </p>
              </div>
            ) : (
              <>
                {/* LIST HEADER */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
                  gap: '12px',
                  padding: '10px 16px',
                  color: '#666',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid #333',
                }}>
                  <span>Client</span>
                  <span>Plan</span>
                  <span>Goal</span>
                  <span>Weight</span>
                  <span>Activity</span>
                  <span>Updates</span>
                </div>

                {/* CLIENT ROWS */}
                {filteredClients.map((client) => {
                  return (
                    <div
                      key={client.id}
                      onClick={() => openClientDetails(client)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
                        gap: '12px',
                        padding: '14px 16px',
                        background: '#1a1a1a',
                        border: '1px solid #222',
                        borderRadius: '8px',
                        cursor: loadingClient === client.id ? 'wait' : 'pointer',
                        opacity: loadingClient === client.id ? 0.6 : 1,
                        transition: 'all 0.2s',
                        alignItems: 'center',
                      }}
                      onMouseEnter={e => {
                        if (loadingClient !== client.id) {
                          e.currentTarget.style.borderColor = '#FFD700';
                          e.currentTarget.style.background = '#222';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#222';
                        e.currentTarget.style.background = '#1a1a1a';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      {/* NAME & EMAIL */}
                      <div>
                        <p style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>
                          {client.full_name}
                        </p>
                        <p style={{ color: '#666', fontSize: '11px', margin: '2px 0 0' }}>
                          {client.email}
                        </p>
                      </div>

                      {/* PLAN BADGE */}
                      <div>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 'bold',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          backgroundColor: client.plan_type === 'elite' ? '#FFD70022' : client.plan_type === 'pro' ? '#2196F322' : '#4CAF5022',
                          color: client.plan_type === 'elite' ? '#FFD700' : client.plan_type === 'pro' ? '#2196F3' : '#4CAF50',
                          textTransform: 'uppercase',
                        }}>
                          {client.plan_type}
                        </span>
                      </div>

                      {/* GOAL */}
                      <div>
                        <p style={{ color: '#ccc', fontSize: '12px', margin: 0, textTransform: 'capitalize' }}>
                          {client.primary_goal?.replace(/-/g, ' ')}
                        </p>
                      </div>

                      {/* WEIGHT */}
                      <div>
                        <p style={{ color: '#ccc', fontSize: '12px', margin: 0 }}>
                          {client.current_weight} → {client.goal_weight}
                        </p>
                        <p style={{ 
                          color: parseFloat(client.goal_weight) < parseFloat(client.current_weight) ? '#22c55e' : '#2196F3', 
                          fontSize: '10px', 
                          margin: '2px 0 0',
                          fontWeight: 'bold',
                        }}>
                          {parseFloat(client.goal_weight) < parseFloat(client.current_weight) 
                            ? '↓ ' + Math.round(client.current_weight - client.goal_weight) + ' lbs'
                            : '↑ ' + Math.round(client.goal_weight - client.current_weight) + ' lbs'}
                        </p>
                      </div>

                      {/* ACTIVITY */}
                      <div>
                        <p style={{ color: '#888', fontSize: '12px', margin: 0, textTransform: 'capitalize' }}>
                          {client.activity_level?.replace(/-/g, ' ')}
                        </p>
                      </div>

                      {/* UPDATES COLUMN */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* PHOTO EMOJI */}
                        {client.unreviewed_photos_count > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openClientDetails(client);
                              setTimeout(() => {
                                setModalTab('photos');
                              }, 150);
                            }}
                            title={`${client.unreviewed_photos_count} new photo${client.unreviewed_photos_count > 1 ? 's' : ''}`}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '20px',
                              cursor: 'pointer',
                              padding: '0',
                              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                              filter: 'drop-shadow(0 0 8px rgba(255, 100, 100, 0.8))',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.fontSize = '24px';
                              e.currentTarget.style.filter = 'drop-shadow(0 0 12px rgba(255, 100, 100, 1))';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.fontSize = '20px';
                              e.currentTarget.style.filter = 'drop-shadow(0 0 8px rgba(255, 100, 100, 0.8))';
                            }}
                          >
                            📸
                          </button>
                        )}

                        {/* CHECK-IN EMOJI */}
                        {client.unreviewed_checkins_count > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openClientDetails(client);
                              setTimeout(() => {
                                setModalTab('checkins');
                              }, 150);
                            }}
                            title={`${client.unreviewed_checkins_count} new check-in${client.unreviewed_checkins_count > 1 ? 's' : ''}`}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '20px',
                              cursor: 'pointer',
                              padding: '0',
                              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                              filter: 'drop-shadow(0 0 8px rgba(100, 150, 255, 0.8))',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.fontSize = '24px';
                              e.currentTarget.style.filter = 'drop-shadow(0 0 12px rgba(100, 150, 255, 1))';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.fontSize = '20px';
                              e.currentTarget.style.filter = 'drop-shadow(0 0 8px rgba(100, 150, 255, 0.8))';
                            }}
                          >
                            📋
                          </button>
                        )}

                        {/* WEIGHT LOG EMOJI */}
                        {client.recent_weight_log === true && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openClientDetails(client);
                              setTimeout(() => {
                                setModalTab('progress');
                              }, 150);
                            }}
                            title="New weight logged"
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '20px',
                              cursor: 'pointer',
                              padding: '0',
                              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                              filter: 'drop-shadow(0 0 8px rgba(100, 255, 100, 0.8))',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.fontSize = '24px';
                              e.currentTarget.style.filter = 'drop-shadow(0 0 12px rgba(100, 255, 100, 1))';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.fontSize = '20px';
                              e.currentTarget.style.filter = 'drop-shadow(0 0 8px rgba(100, 255, 100, 0.8))';
                            }}
                          >
                            ⚡
                          </button>
                        )}

                        {/* EMPTY STATE */}
                        {client.unreviewed_photos_count === 0 &&
                          client.unreviewed_checkins_count === 0 &&
                          client.recent_weight_log !== true && (
                          <span style={{ color: '#555', fontSize: '12px' }}>—</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* RESULT COUNT */}
                <p style={{ color: '#555', fontSize: '12px', textAlign: 'center', margin: '8px 0 0' }}>
                  Showing {filteredClients.length} of {activeTab === 'pending' ? pendingClients.length : approvedClients.length} clients
                </p>
              </>
            )}
          </div>
        )}

      </div>

      {/* ─── CLIENT DETAIL MODAL ─── */}
      {showModal && selectedClient && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>

            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>{selectedClient.full_name}</h2>
                <span style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '999px',
                  backgroundColor: selectedClient.plan_type === 'elite' ? '#FFD70022' : selectedClient.plan_type === 'pro' ? '#2196F322' : '#4CAF5022',
                  color: selectedClient.plan_type === 'elite' ? '#FFD700' : selectedClient.plan_type === 'pro' ? '#2196F3' : '#4CAF50',
                  fontWeight: 'bold',
                }}>
                  {selectedClient.plan_type?.toUpperCase()} PLAN
                </span>
              </div>
              <button onClick={() => setShowModal(false)} className={styles.modalClose}>X</button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '8px', padding: '0 24px 16px', borderBottom: '1px solid #222', overflowX: 'auto' }}>
              {[
                { key: 'info',      label: '👤 Info' },
                { key: 'history',   label: '🕐 History' },
                { key: 'progress',  label: '📈 Progress' },
                { key: 'checkins',  label: '📋 Check-ins' },
                { key: 'photos',    label: '📸 Photos' },
              ].map(tab => (
                <button
                  key={tab.key}
                  data-tab={tab.key}
                  onClick={() => handleModalTabChange(tab.key)}
                  style={{
                    padding: '6px 14px', borderRadius: '999px',
                    border: '1px solid ' + (modalTab === tab.key ? '#FFD700' : '#333'),
                    backgroundColor: modalTab === tab.key ? '#FFD700' : 'transparent',
                    color: modalTab === tab.key ? '#000' : '#888',
                    fontWeight: 'bold', fontSize: '12px',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className={styles.modalContent}>
              {/* INFO TAB CONTENT (keeping your original structure) */}
              {modalTab === 'info' && (
                <div>
                  <div className={styles.infoSection}>
                    <h3 className={styles.sectionTitle}>Personal Info</h3>
                    <div className={styles.infoGrid2}>
                      <div><span className={styles.label}>Email</span><span className={styles.value}>{selectedClient.email}</span></div>
                      <div><span className={styles.label}>Phone</span><span className={styles.value}>{selectedClient.phone || 'N/A'}</span></div>
                      <div><span className={styles.label}>Age</span><span className={styles.value}>{selectedClient.age}</span></div>
                      <div><span className={styles.label}>Gender</span><span className={styles.value}>{selectedClient.gender}</span></div>
                      <div><span className={styles.label}>Height</span><span className={styles.value}>{formatHeight(selectedClient)}</span></div>
                      <div><span className={styles.label}>Joined</span><span className={styles.value}>{new Date(selectedClient.created_at).toLocaleDateString()}</span></div>
                    </div>
                  </div>

                  <div className={styles.infoSection}>
                    <h3 className={styles.sectionTitle}>Fitness Profile</h3>
                    <div className={styles.infoGrid2}>
                      <div><span className={styles.label}>Goal</span><span className={styles.value}>{selectedClient.primary_goal}</span></div>
                      <div><span className={styles.label}>Current Weight</span><span className={styles.value}>{selectedClient.current_weight} lbs</span></div>
                      <div><span className={styles.label}>Goal Weight</span><span className={styles.value}>{selectedClient.goal_weight} lbs</span></div>
                      <div>
                        <span className={styles.label}>
                          {parseFloat(selectedClient.goal_weight) > parseFloat(selectedClient.current_weight) ? 'To Gain' : 'To Lose'}
                        </span>
                        <span className={styles.value}>
                          {parseFloat(selectedClient.goal_weight) > parseFloat(selectedClient.current_weight)
                            ? '+' + Math.round(selectedClient.goal_weight - selectedClient.current_weight) + ' lbs'
                            : '-' + Math.round(selectedClient.current_weight - selectedClient.goal_weight) + ' lbs'}
                        </span>
                      </div>
                      <div><span className={styles.label}>Experience</span><span className={styles.value}>{selectedClient.experience_level}</span></div>
                      <div><span className={styles.label}>Activity</span><span className={styles.value}>{selectedClient.activity_level}</span></div>
                    </div>
                  </div>

                  {/* TIER & BILLING SECTION */}
                  <div className={styles.infoSection}>
                    <h3 className={styles.sectionTitle}>🎯 Tier & Billing Status</h3>
                    <div className={styles.infoGrid2}>
                      <div>
                        <span className={styles.label}>Current Tier</span>
                        <span className={styles.value}>
                          <span className={
                            styles.tierBadge + ' ' +
                            styles[
                              selectedClient.tier === 'BUILT FOR LIFE' ? 'tier_builtForLife' :
                              selectedClient.tier === 'DEDICATED' ? 'tier_dedicated' :
                              selectedClient.tier === 'COMMITTED' ? 'tier_committed' :
                              'tier_new'
                            ]
                          }>
                            {selectedClient.tier === 'BUILT FOR LIFE' ? '🏆 BUILT FOR LIFE' : 
                             selectedClient.tier === 'DEDICATED' ? '💪 DEDICATED' : 
                             selectedClient.tier === 'COMMITTED' ? '🔥 COMMITTED' : 
                             '⭐ NEW'}
                          </span>
                        </span>
                      </div>
                      <div>
                        <span className={styles.label}>Payments Made</span>
                        <span className={styles.value} style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFD700' }}>
                          {selectedClient.payments_made || 0}
                        </span>
                      </div>
                    </div>

                    {!selectedClient.tier && (
                      <div className={styles.progressContainer}>
                        <p style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>Progress to COMMITTED tier:</p>
                        <div className={styles.progressBar}>
                          <div className={styles.progressFill} style={{ width: `${((selectedClient.payments_made || 0) / 2) * 100}%` }}></div>
                        </div>
                        <p className={styles.progressText}>{selectedClient.payments_made || 0}/2 payments</p>
                      </div>
                    )}
                    
                    {selectedClient.tier === 'COMMITTED' && (
                      <div className={styles.progressContainer}>
                        <p style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>Progress to DEDICATED tier:</p>
                        <div className={styles.progressBar}>
                          <div className={styles.progressFill} style={{ width: `${((selectedClient.payments_made || 0) / 5) * 100}%` }}></div>
                        </div>
                        <p className={styles.progressText}>
                          {selectedClient.payments_made || 0}/5 payments — {Math.max(0, 5 - (selectedClient.payments_made || 0))} more needed
                        </p>
                      </div>
                    )}
                    
                    {selectedClient.tier === 'DEDICATED' && (
                      <div className={styles.progressContainer}>
                        <p style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>Progress to BUILT FOR LIFE:</p>
                        <div className={styles.progressBar}>
                          <div className={styles.progressFill} style={{ width: `${((selectedClient.payments_made || 0) / 10) * 100}%` }}></div>
                        </div>
                        <p className={styles.progressText}>
                          {selectedClient.payments_made || 0}/10 payments — {Math.max(0, 10 - (selectedClient.payments_made || 0))} more needed
                        </p>
                      </div>
                    )}
                    
                    {selectedClient.tier === 'BUILT FOR LIFE' && (
                      <div className={styles.tierLockNotice}>
                        <p className={styles.tierLockText}>
                          🏆 BUILT FOR LIFE — This client has reached the highest tier and has locked-in rates forever.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* REFERRAL & EARNINGS SECTION */}
                  <div className={styles.infoSection}>
                    <h3 className={styles.sectionTitle}>🎁 Referral & Earnings</h3>
                    <div className={styles.infoGrid2}>
                      <div>
                        <span className={styles.label}>Your Referral Code</span>
                        <span className={styles.value} style={{ fontFamily: 'monospace', fontSize: '16px', letterSpacing: '1px', color: '#FFD700' }}>
                          {selectedClient.referral_code || 'Not assigned'}
                        </span>
                      </div>
                      <div>
                        <span className={styles.label}>Total Referrals Made</span>
                        <span className={styles.value} style={{ fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' }}>
                          {selectedClient.referrals_made_count || 0}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                      <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '12px', border: '1px solid #333' }}>
                        <p style={{ color: '#888', fontSize: '11px', margin: '0 0 6px', fontWeight: 'bold', textTransform: 'uppercase' }}>Completed Referrals</p>
                        <p style={{ color: '#4CAF50', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                          {selectedClient.referrals_completed_count || 0}
                        </p>
                      </div>
                      <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '12px', border: '1px solid #333' }}>
                        <p style={{ color: '#888', fontSize: '11px', margin: '0 0 6px', fontWeight: 'bold', textTransform: 'uppercase' }}>Pending Approval</p>
                        <p style={{ color: '#FFA500', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                          {selectedClient.referrals_pending_count || 0}
                        </p>
                      </div>
                    </div>

                    <div style={{ background: '#FFD70011', border: '1px solid #FFD70033', borderRadius: '8px', padding: '12px', marginTop: '12px' }}>
                      <p style={{ color: '#FFD700', fontSize: '11px', margin: '0 0 6px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💰 Credits Earned</p>
                      <p style={{ color: '#FFD700', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                        ${(selectedClient.referrals_completed_count || 0) * 40}
                      </p>
                      <p style={{ color: '#888', fontSize: '11px', margin: '4px 0 0', fontStyle: 'italic' }}>
                        $40 per completed referral
                      </p>
                    </div>

                    {selectedClient.referral_code && (
                      <div style={{ background: '#051a0d', border: '1px solid #1a3a1a', borderRadius: '8px', padding: '12px', marginTop: '12px' }}>
                        <p style={{ color: '#22c55e', fontSize: '11px', margin: '0 0 8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Share Your Code</p>
                        <p style={{ color: '#ccc', fontSize: '12px', margin: 0, lineHeight: '1.6' }}>
                          Send friends to: <br />
                          <code style={{ background: '#111', padding: '4px 8px', borderRadius: '4px', display: 'block', marginTop: '6px', color: '#FFD700' }}>
                            buildabod.co/intake?ref={selectedClient.referral_code}
                          </code>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className={styles.infoSection}>
                    <h3 className={styles.sectionTitle}>Diet & Preferences</h3>
                    <div className={styles.infoGrid2}>
                      <div><span className={styles.label}>Diet Type</span><span className={styles.value}>{selectedClient.dietary_restrictions || 'Omnivore'}</span></div>
                      <div><span className={styles.label}>Allergies</span><span className={styles.value}>{formatAllergies(selectedClient)}</span></div>
                      <div><span className={styles.label}>Meals/Day</span><span className={styles.value}>{selectedClient.meals_per_day}</span></div>
                      <div><span className={styles.label}>Meal Pattern</span><span className={styles.value}>{selectedClient.meal_pattern || 'N/A'}</span></div>
                      <div><span className={styles.label}>Cardio</span><span className={styles.value}>{selectedClient.cardio_duration || 'N/A'}</span></div>
                      <div><span className={styles.label}>Cooking</span><span className={styles.value}>{(() => { if (!selectedClient.cooking_methods) return 'N/A'; try { const p = typeof selectedClient.cooking_methods === 'string' ? JSON.parse(selectedClient.cooking_methods) : selectedClient.cooking_methods; return Array.isArray(p) ? p.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ') : selectedClient.cooking_methods; } catch (e) { return selectedClient.cooking_methods; } })()}</span></div>
                    </div>
                  </div>

                  <div className={styles.infoSection}>
                    <h3 className={styles.sectionTitle}>Plan Details</h3>
                    <div className={styles.infoGrid2}>
                      <div><span className={styles.label}>Plan Type</span><span className={styles.value}>{selectedClient.plan_type?.toUpperCase()}</span></div>
                      <div><span className={styles.label}>Payment Status</span><span className={styles.value}>{selectedClient.payment_status}</span></div>
                      <div>
                        <span className={styles.label}>Plan Status</span>
                        <span className={styles.value}>
                          {selectedClient.meal_plans ? '✅ Generated' : '⏳ Pending'}
                        </span>
                      </div>
                      <div>
                        <span className={styles.label}>Foods Selected</span>
                        <span className={styles.value}>
                          {(() => {
                            try {
                              let foods = selectedClient.selected_foods;
                              if (!foods) return '0 foods';
                              if (typeof foods === 'string') {
                                foods = JSON.parse(foods);
                              }
                              if (Array.isArray(foods)) {
                                return foods.length + ' foods';
                              }
                              if (typeof foods === 'object') {
                                const totalFoods = Object.values(foods).reduce((sum, arr) => {
                                  return sum + (Array.isArray(arr) ? arr.length : 0);
                                }, 0);
                                return totalFoods > 0 ? totalFoods + ' foods' : '0 foods';
                              }
                              return '0 foods';
                            } catch (e) { 
                              return '0 foods';
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {macroLoading ? (
                    <div className={styles.loadingBox}>
                      <div className={styles.spinner}></div>
                      <p>Loading macros...</p>
                    </div>
                  ) : macroError ? (
                    <div className={styles.errorBox}><p>{macroError}</p></div>
                  ) : !macroData ? (
                    <div style={{ background: '#FFD70011', border: '1px solid #FFD70033', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                      <p style={{ color: '#FFD700', fontWeight: 'bold', marginBottom: '12px' }}>No macros generated yet</p>
                      <button
                        onClick={() => handleRegenerateMealPlan(selectedClient.id)}
                        disabled={regeneratingId === selectedClient.id}
                        style={{
                          background: '#FFD700', color: '#000', fontWeight: 'bold',
                          padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px'
                        }}
                      >
                        {regeneratingId === selectedClient.id ? 'Generating...' : '⚡ Generate Macros'}
                      </button>
                    </div>
                  ) : (
                    <div className={styles.macrosSection}>
                      <h3 className={styles.sectionTitle}>Daily Macro Targets</h3>
                      <div className={styles.macrosGrid}>
                        <div className={styles.macroCard}>
                          <span className={styles.macroLabel}>Calories</span>
                          <p className={styles.macroValue} style={{ color: '#FFD700' }}>{macroData.daily_calories}</p>
                        </div>
                        <div className={styles.macroCard}>
                          <span className={styles.macroLabel}>Protein</span>
                          <p className={styles.macroValue} style={{ color: '#FF6B35' }}>{macroData.daily_protein_g}g</p>
                        </div>
                        <div className={styles.macroCard}>
                          <span className={styles.macroLabel}>Carbs</span>
                          <p className={styles.macroValue} style={{ color: '#4CAF50' }}>{macroData.daily_carbs_g}g</p>
                        </div>
                        <div className={styles.macroCard}>
                          <span className={styles.macroLabel}>Fats</span>
                          <p className={styles.macroValue} style={{ color: '#2196F3' }}>{macroData.daily_fats_g}g</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={styles.notesSection}>
                    <div className={styles.notesSectionHeader}>
                      <h3 className={styles.sectionTitle}>Coaching Notes</h3>
                      <button onClick={() => setShowNotesModal(true)} className={styles.editNotesBtn}>Edit</button>
                    </div>
                    <div className={styles.notesBox}>
                      <p className={styles.notesText}>
                        {coachingNotes || <span className={styles.noNotes}>No notes yet...</span>}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* HISTORY TAB */}
              {modalTab === 'history' && (
                <div>
                  {historyLoading ? (
                    <div className={styles.loadingBox}>
                      <div className={styles.spinner}></div>
                      <p>Loading history...</p>
                    </div>
                  ) : planHistory && planHistory.length > 0 ? (
                    <div className={styles.historySection}>
                      <h3 className={styles.sectionTitle}>Plan History</h3>
                      <div className={styles.historyTimeline}>
                        {planHistory.map((item, idx) => (
                          <div key={idx} className={styles.historyItem}>
                            <div className={styles.historyDot}></div>
                            <div className={styles.historyContent}>
                              <p className={styles.historyAction}>{item.action_type?.replace(/_/g, ' ').toUpperCase()}</p>
                              <p className={styles.historyDate}>{new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}</p>
                              <div className={styles.historyMacros}>
                                <span>{item.daily_calories} cal</span>
                                <span>P: {item.daily_protein}g</span>
                                <span>C: {item.daily_carbs}g</span>
                                <span>F: {item.daily_fats}g</span>
                              </div>
                              {item.admin_notes && <p className={styles.historyNotes}>{item.admin_notes}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <p className={styles.emptyIcon}>📋</p>
                      <p className={styles.emptyText}>No plan history yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* PROGRESS TAB */}
              {modalTab === 'progress' && (
                <div>
                  <h3 className={styles.sectionTitle}>Weight Progress</h3>
                  {clientWeightLogs.length > 0 ? (
                    <div>
                      <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '20px', marginBottom: '16px', border: '1px solid #333' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#888' }}>
                          <span>Start: <strong style={{ color: '#fff' }}>{selectedClient.current_weight} lbs</strong></span>
                          <span>Goal: <strong style={{ color: '#fff' }}>{selectedClient.goal_weight} lbs</strong></span>
                        </div>
                        <div style={{ width: '100%', background: '#333', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                          <div style={{
                            height: '10px', borderRadius: '999px', background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                            width: (() => {
                              const start  = parseFloat(selectedClient.current_weight)
                              const goal   = parseFloat(selectedClient.goal_weight)
                              const latest = parseFloat(clientWeightLogs[clientWeightLogs.length - 1]?.weight_lbs || start)
                              const total  = start - goal
                              const lost   = start - latest
                              return total > 0 ? Math.min(100, Math.max(0, (lost / total) * 100)) + '%' : '0%'
                            })(),
                          }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#666' }}>
                          <span>Current: <strong style={{ color: '#FFD700' }}>{parseFloat(clientWeightLogs[clientWeightLogs.length - 1]?.weight_lbs || selectedClient.current_weight).toFixed(1)} lbs</strong></span>
                          <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
                            {(() => {
                              const start  = parseFloat(selectedClient.current_weight)
                              const latest = parseFloat(clientWeightLogs[clientWeightLogs.length - 1]?.weight_lbs || start)
                              const lost   = start - latest
                              return lost > 0 ? 'Down ' + lost.toFixed(1) + ' lbs' : 'No change yet'
                            })()}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[...clientWeightLogs].reverse().map((log, idx) => {
                          const prev = clientWeightLogs[clientWeightLogs.length - 2 - idx]
                          const diff = prev ? parseFloat(log.weight_lbs) - parseFloat(prev.weight_lbs) : null
                          return (
                            <div key={log.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', borderRadius: '8px', padding: '12px 16px', border: '1px solid #222' }}>
                              <div>
                                <p style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px', margin: 0 }}>{parseFloat(log.weight_lbs).toFixed(1)} lbs</p>
                                <p style={{ color: '#666', fontSize: '11px', margin: '2px 0 0' }}>{new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                {log.notes && <p style={{ color: '#888', fontSize: '11px', margin: '2px 0 0' }}>{log.notes}</p>}
                              </div>
                              {diff !== null && (
                                <span style={{ fontWeight: 'bold', fontSize: '13px', color: diff < 0 ? '#22c55e' : '#ef4444' }}>
                                  {diff > 0 ? '+' : ''}{diff.toFixed(1)} lbs
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <p className={styles.emptyIcon}>📊</p>
                      <p className={styles.emptyText}>No weight logs yet</p>
                    </div>
                  )}

                  {/* PENDING WEIGHT CORRECTIONS */}
                  <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #333' }}>
                    <h3 className={styles.sectionTitle}>Pending Weight Corrections</h3>
                    {clientWeightCorrections && clientWeightCorrections.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {clientWeightCorrections.map((correction, idx) => (
                          <div
                            key={correction.id || idx}
                            style={{
                              background: '#1a1a1a',
                              border: '2px solid #ef4444',
                              borderRadius: '12px',
                              padding: '16px',
                              boxShadow: '0 0 12px rgba(239, 68, 68, 0.2)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                              <div>
                                <p style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px', margin: 0 }}>
                                  ⚠️ Correction Request
                                </p>
                                <p style={{ color: '#888', fontSize: '11px', margin: '2px 0 0' }}>
                                  {new Date(correction.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </p>
                              </div>
                              <span
                                style={{
                                  fontSize: '11px',
                                  padding: '3px 10px',
                                  borderRadius: '999px',
                                  backgroundColor: '#ef444422',
                                  color: '#ef4444',
                                  fontWeight: 'bold',
                                }}
                              >
                                PENDING
                              </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                              <div style={{ background: '#111', borderRadius: '8px', padding: '10px', borderLeft: '3px solid #ef4444' }}>
                                <p style={{ color: '#888', fontSize: '11px', margin: '0 0 4px' }}>Original</p>
                                <p style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '16px', margin: 0 }}>
                                  {parseFloat(correction.original_weight).toFixed(1)} lbs
                                </p>
                              </div>
                              <div style={{ background: '#111', borderRadius: '8px', padding: '10px', borderLeft: '3px solid #22c55e' }}>
                                <p style={{ color: '#888', fontSize: '11px', margin: '0 0 4px' }}>Corrected To</p>
                                <p style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '16px', margin: 0 }}>
                                  {parseFloat(correction.corrected_weight).toFixed(1)} lbs
                                </p>
                              </div>
                            </div>

                            {correction.reason && (
                              <div style={{ background: '#111', borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
                                <p style={{ color: '#888', fontSize: '11px', margin: '0 0 4px' }}>Reason:</p>
                                <p style={{ color: '#ccc', fontSize: '12px', margin: 0 }}>{correction.reason}</p>
                              </div>
                            )}

                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleApproveWeightCorrection(correction)}
                                disabled={approvingCorrection === correction.id}
                                style={{
                                  flex: 1,
                                  padding: '8px 14px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  backgroundColor: '#22c55e',
                                  color: '#000',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: approvingCorrection === correction.id ? 'not-allowed' : 'pointer',
                                  opacity: approvingCorrection === correction.id ? 0.6 : 1,
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => {
                                  if (approvingCorrection !== correction.id) {
                                    e.target.style.backgroundColor = '#16a34a';
                                  }
                                }}
                                onMouseLeave={e => {
                                  e.target.style.backgroundColor = '#22c55e';
                                }}
                              >
                                {approvingCorrection === correction.id ? '✓ Approving...' : '✓ Approve'}
                              </button>
                              <button
                                onClick={() => handleDenyWeightCorrection(correction)}
                                disabled={denyingCorrection === correction.id}
                                style={{
                                  flex: 1,
                                  padding: '8px 14px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  backgroundColor: '#ef4444',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: denyingCorrection === correction.id ? 'not-allowed' : 'pointer',
                                  opacity: denyingCorrection === correction.id ? 0.6 : 1,
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => {
                                  if (denyingCorrection !== correction.id) {
                                    e.target.style.backgroundColor = '#dc2626';
                                  }
                                }}
                                onMouseLeave={e => {
                                  e.target.style.backgroundColor = '#ef4444';
                                }}
                              >
                                {denyingCorrection === correction.id ? '✗ Denying...' : '✗ Deny'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '24px', color: '#666' }}>
                        <p style={{ margin: 0, fontSize: '13px' }}>✅ No pending corrections</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CHECK-INS TAB */}
              {modalTab === 'checkins' && (
                <div>
                  <h3 className={styles.sectionTitle}>
                    Client Check-ins
                    <span style={{ color: '#666', fontSize: '12px', fontWeight: 400, marginLeft: '8px' }}>({clientCheckins.length} total)</span>
                  </h3>
                  {clientCheckins.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {clientCheckins.map((ci, idx) => (
                        <div key={ci.id || idx} style={{ background: '#1a1a1a', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden' }}>
                          <div style={{ padding: '14px 16px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <p style={{ fontWeight: 'bold', color: '#FFD700', fontSize: '14px', margin: 0 }}>{'⭐'.repeat(ci.feeling_rating || 0)} ({ci.feeling_rating || 0}/5)</p>
                              <p style={{ color: '#666', fontSize: '11px', margin: '2px 0 0' }}>
                                {new Date(ci.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                {ci.week_number && ` • Week ${ci.week_number}`}
                              </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {ci.admin_response && (
                                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', backgroundColor: '#05200f', color: '#22c55e', fontWeight: 'bold' }}>✓ Replied</span>
                              )}
                              {ci.week_number && (
                                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', backgroundColor: '#FFD70022', color: '#FFD700', fontWeight: 'bold' }}>Week {ci.week_number}</span>
                              )}
                            </div>
                          </div>

                          {ci.logged_weight && (
                            <div style={{ 
                              margin: '0 16px 12px', 
                              padding: '8px 12px', 
                              backgroundColor: '#FFD70011', 
                              borderRadius: '4px', 
                              border: '1px solid #FFD70033',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span style={{ fontSize: '12px', color: '#999' }}>Weight This Week</span>
                              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#FFD700' }}>
                                {ci.logged_weight} lbs
                                {selectedClient.current_weight && (
                                  <span style={{ marginLeft: '8px', color: ci.logged_weight < selectedClient.current_weight ? '#22c55e' : '#f97316', fontSize: '11px' }}>
                                    ({ci.logged_weight < selectedClient.current_weight ? '−' : '+'}{Math.abs(ci.logged_weight - selectedClient.current_weight).toFixed(1)})
                                  </span>
                                )}
                              </span>
                            </div>
                          )}

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '14px 16px', borderBottom: '1px solid #222' }}>
                            {[
                              { label: 'Hit Macros', value: ci.hit_macros || 'N/A' },
                              { label: 'Energy',     value: ci.energy_level || 'N/A' },
                                                            { label: 'Sleep',      value: ci.sleep_quality || 'N/A' },
                            ].map((item, i) => (
                              <div key={i} style={{ background: '#111', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                                <p style={{ color: '#666', fontSize: '10px', margin: '0 0 2px' }}>{item.label}</p>
                                <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px', textTransform: 'capitalize', margin: 0 }}>{item.value}</p>
                              </div>
                            ))}
                          </div>
                          {(ci.food_swap_requests || ci.notes_for_dane) && (
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {ci.food_swap_requests && (
                                <div style={{ background: '#111', borderRadius: '8px', padding: '10px' }}>
                                  <p style={{ color: '#FFD700', fontSize: '11px', fontWeight: 'bold', margin: '0 0 4px' }}>Food Swap Requests:</p>
                                  <p style={{ color: '#ccc', fontSize: '12px', margin: 0 }}>{ci.food_swap_requests}</p>
                                </div>
                              )}
                              {ci.notes_for_dane && (
                                <div style={{ background: '#111', borderRadius: '8px', padding: '10px' }}>
                                  <p style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', margin: '0 0 4px' }}>Notes for Dane:</p>
                                  <p style={{ color: '#ccc', fontSize: '12px', margin: 0 }}>{ci.notes_for_dane}</p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Edit Plan Button */}
                          {(ci.food_swap_requests || ci.notes_for_dane) && (
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid #222' }}>
                              <button
                                onClick={() => {
                                  setSelectedCheckinForEdit(ci)
                                  setShowPlanEditor(true)
                                }}
                                style={{
                                  padding: '8px 14px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  backgroundColor: '#22c55e',
                                  color: '#000',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  boxShadow: '0 0 12px #22c55e33',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#16a34a'
                                  e.target.style.boxShadow = '0 0 16px #22c55e55'
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = '#22c55e'
                                  e.target.style.boxShadow = '0 0 12px #22c55e33'
                                }}
                              >
                                ✏️ Edit Plan
                              </button>
                            </div>
                          )}

                          {ci.admin_response && (
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid #222' }}>
                              <div style={{ background: '#051a0d', border: '1px solid #1a3a1a', borderLeft: '3px solid #22c55e', borderRadius: '8px', padding: '12px' }}>
                                <p style={{ color: '#22c55e', fontSize: '11px', fontWeight: 'bold', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  {'Your Response · ' + new Date(ci.admin_responded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                                <p style={{ color: '#fff', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{ci.admin_response}</p>
                              </div>
                            </div>
                          )}
                          <div style={{ padding: '14px 16px' }}>
                            <p style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px', fontWeight: 'bold' }}>
                              {ci.admin_response ? 'Update Your Response' : 'Send a Response'}
                            </p>
                            <textarea
                              value={replyText[ci.id] || ''}
                              onChange={e => setReplyText(prev => ({ ...prev, [ci.id]: e.target.value }))}
                              placeholder={'Reply to ' + (selectedClient.full_name?.split(' ')[0] || 'client') + '\'s check-in...'}
                              rows={3}
                              style={{ width: '100%', backgroundColor: '#111', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: '1.5' }}
                              onFocus={e => e.target.style.borderColor = '#FFD700'}
                              onBlur={e => e.target.style.borderColor = '#333'}
                            />
                            <button
                              onClick={() => handleSendReply(ci)}
                              disabled={sendingReply === ci.id || !replyText[ci.id]?.trim()}
                              style={{
                                marginTop: '8px',
                                backgroundColor: replyText[ci.id]?.trim() ? '#FFD700' : '#1a1a1a',
                                border: '1px solid ' + (replyText[ci.id]?.trim() ? '#FFD700' : '#333'),
                                color: replyText[ci.id]?.trim() ? '#000' : '#444',
                                padding: '9px 20px', borderRadius: '8px',
                                cursor: replyText[ci.id]?.trim() ? 'pointer' : 'not-allowed',
                                fontSize: '12px', fontWeight: 'bold', transition: 'all 0.2s',
                              }}
                            >
                              {sendingReply === ci.id ? 'Sending...' : ci.admin_response ? '↺ Update Response' : '✉ Send Response'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <p className={styles.emptyIcon}>📝</p>
                      <p className={styles.emptyText}>No check-ins submitted yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* PHOTOS TAB */}
              {modalTab === 'photos' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 className={styles.sectionTitle} style={{ margin: 0 }}>
                      Progress Photos
                      <span style={{ color: '#666', fontSize: '12px', fontWeight: 400, marginLeft: '8px' }}>
                        ({clientPhotos.length} total)
                      </span>
                    </h3>
                    {['pro', 'elite'].includes(selectedClient.plan_type?.toLowerCase()) ? (
                      <span style={{ fontSize: '11px', color: '#22c55e', backgroundColor: '#05200f', border: '1px solid #1a3a1a', borderRadius: '999px', padding: '3px 10px', fontWeight: 'bold' }}>
                        ✓ Feedback Enabled
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#888', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '999px', padding: '3px 10px' }}>
                        kickstart — No Feedback
                      </span>
                    )}
                  </div>

                  {photosLoading ? (
                    <div className={styles.loadingBox}>
                      <div className={styles.spinner}></div>
                      <p>Loading photos...</p>
                    </div>
                  ) : clientPhotos.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p className={styles.emptyIcon}>📸</p>
                      <p className={styles.emptyText}>No progress photos uploaded yet</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {clientPhotos.length >= 2 && (
                        <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '14px', overflow: 'hidden' }}>
                          <div style={{ padding: '12px 16px', borderBottom: '1px solid #222' }}>
                            <p style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '13px', margin: 0 }}>↔️ Before vs Latest</p>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                            <div style={{ position: 'relative' }}>
                              <img
                                src={clientPhotos[0]?.signedUrl || clientPhotos[0]?.photo_url}
                                alt="Week 1"
                                style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
                              />
                              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '8px 12px' }}>
                                <span style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}>WEEK 1</span>
                              </div>
                            </div>
                            <div style={{ position: 'relative' }}>
                              <img
                                src={clientPhotos[clientPhotos.length - 1]?.signedUrl || clientPhotos[clientPhotos.length - 1]?.photo_url}
                                alt="Latest"
                                style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
                              />
                              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '8px 12px' }}>
                                <span style={{ color: '#FFD700', fontSize: '11px', fontWeight: 'bold' }}>LATEST — WEEK {clientPhotos.length}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {clientPhotos.map((photo, idx) => {
                        const isReviewed = !!photo.dane_feedback
                        const canFeedback = ['pro', 'elite'].includes(selectedClient.plan_type?.toLowerCase())
                        return (
                          <div
                            key={photo.id}
                            style={{
                              background: '#1a1a1a',
                              border: '1px solid ' + (!isReviewed && canFeedback ? '#FFD700' : '#333'),
                              boxShadow: !isReviewed && canFeedback ? '0 0 16px rgba(255,215,0,0.1)' : 'none',
                              borderRadius: '14px',
                              overflow: 'hidden',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #222' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ backgroundColor: '#FFD70022', color: '#FFD700', fontSize: '11px', fontWeight: 'bold', borderRadius: '999px', padding: '2px 10px' }}>
                                  WEEK {idx + 1}
                                </span>
                                {!isReviewed && canFeedback && (
                                  <span style={{ backgroundColor: '#ef444422', color: '#ef4444', fontSize: '10px', fontWeight: 'bold', borderRadius: '999px', padding: '2px 8px' }}>
                                    NEEDS REVIEW
                                  </span>
                                )}
                                {isReviewed && (
                                  <span style={{ backgroundColor: '#05200f', color: '#22c55e', fontSize: '10px', fontWeight: 'bold', borderRadius: '999px', padding: '2px 8px' }}>
                                    ✓ REVIEWED
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#555', fontSize: '11px' }}>
                                  {new Date(photo.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <button
                                  onClick={() => setShowDeleteConfirm(photo.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: '16px', padding: '2px', lineHeight: 1 }}
                                  title="Delete photo"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>

                            <div style={{ background: '#111' }}>
                              {photo.signedUrl || photo.photo_url ? (
                                <img
                                  src={photo.signedUrl || photo.photo_url}
                                  alt={'Week ' + (idx + 1) + ' progress'}
                                  style={{ width: '100%', maxHeight: '340px', objectFit: 'contain', display: 'block', background: '#000' }}
                                />
                              ) : (
                                <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: '13px' }}>
                                  Photo unavailable
                                </div>
                              )}
                            </div>

                            <div style={{ padding: '16px' }}>
                              {!canFeedback ? (
                                <p style={{ color: '#555', fontSize: '12px', fontStyle: 'italic', textAlign: 'center', margin: 0 }}>
                                  kickstart plan — feedback not required
                                </p>
                              ) : (
                                <div>
                                  {isReviewed && (
                                    <div style={{ background: '#051a0d', border: '1px solid #1a3a1a', borderLeft: '3px solid #22c55e', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
                                      <p style={{ color: '#22c55e', fontSize: '10px', fontWeight: 'bold', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Feedback</p>
                                      <p style={{ color: '#fff', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{photo.dane_feedback}</p>
                                    </div>
                                  )}
                                  <p style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px', fontWeight: 'bold' }}>
                                    {isReviewed ? 'Update Feedback' : 'Leave Feedback'}
                                  </p>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                    {QUICK_REPLIES.map((reply, i) => (
                                      <button
                                        key={i}
                                        onClick={() => setPhotoFeedback(prev => ({ ...prev, [photo.id]: reply }))}
                                        style={{
                                          fontSize: '10px', color: '#666', backgroundColor: '#111',
                                          border: '1px solid #2a2a2a', borderRadius: '6px',
                                          padding: '4px 8px', cursor: 'pointer', transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={e => { e.target.style.borderColor = '#FFD700'; e.target.style.color = '#FFD700' }}
                                        onMouseLeave={e => { e.target.style.borderColor = '#2a2a2a'; e.target.style.color = '#666' }}
                                      >
                                        {reply.slice(0, 28)}…
                                      </button>
                                    ))}
                                  </div>
                                  <textarea
                                    value={photoFeedback[photo.id] || ''}
                                    onChange={e => setPhotoFeedback(prev => ({ ...prev, [photo.id]: e.target.value }))}
                                    placeholder="Leave 1–2 sentences of feedback..."
                                    rows={3}
                                    maxLength={500}
                                    style={{
                                      width: '100%', backgroundColor: '#111', border: '1px solid #333',
                                      color: '#fff', padding: '10px 12px', borderRadius: '8px',
                                      fontSize: '13px', resize: 'vertical', outline: 'none',
                                      boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: '1.5',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#FFD700'}
                                    onBlur={e => e.target.style.borderColor = '#333'}
                                  />
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                    <span style={{ color: '#444', fontSize: '11px' }}>{(photoFeedback[photo.id] || '').length}/500</span>
                                    <button
                                      onClick={() => handleSaveFeedback(photo.id)}
                                      disabled={savingFeedback === photo.id || !photoFeedback[photo.id]?.trim()}
                                      style={{
                                        backgroundColor: photoFeedback[photo.id]?.trim() ? '#FFD700' : '#1a1a1a',
                                        border: '1px solid ' + (photoFeedback[photo.id]?.trim() ? '#FFD700' : '#333'),
                                        color: photoFeedback[photo.id]?.trim() ? '#000' : '#444',
                                        padding: '8px 20px', borderRadius: '8px',
                                        cursor: photoFeedback[photo.id]?.trim() ? 'pointer' : 'not-allowed',
                                        fontSize: '12px', fontWeight: 'bold', transition: 'all 0.2s',
                                      }}
                                    >
                                      {savingFeedback === photo.id ? 'Saving...' : isReviewed ? '↺ Update' : 'Send Feedback'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Action Buttons */}
            <div className={styles.modalActions}>
              {activeTab === 'pending' && (
                <button
                  onClick={() => handleApprovePlan(selectedClient.id)}
                  disabled={approvingId === selectedClient.id}
                  className={styles.approveMainBtn}
                >
                  {approvingId === selectedClient.id ? 'Approving...' : 'Approve & Send to Client'}
                </button>
              )}
              {activeTab === 'approved' && (
                <button
                  onClick={() => handleResendPlan(selectedClient.id)}
                  disabled={resendingId === selectedClient.id}
                  className={styles.approveMainBtn}
                >
                  {resendingId === selectedClient.id ? 'Sending...' : 'Resend Plan Link'}
                </button>
              )}
              <button
                onClick={() => setShowMacroModal(true)}
                disabled={!macroData}
                className={styles.editMacrosBtn}
              >
                Edit Macros
              </button>
              <button
                onClick={() => handleRegenerateMealPlan(selectedClient.id)}
                disabled={regeneratingId === selectedClient.id}
                className={styles.regenerateBtn}
              >
                {regeneratingId === selectedClient.id ? 'Regenerating...' : 'Regenerate Plan'}
              </button>
              <button onClick={() => setShowModal(false)} className={styles.closeBtn}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE PHOTO CONFIRM MODAL */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '16px', padding: '28px', maxWidth: '360px', width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🗑️</div>
            <h3 style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px', margin: '0 0 8px' }}>Delete Photo?</h3>
            <p style={{ color: '#888', fontSize: '13px', margin: '0 0 24px' }}>This permanently removes the photo and cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{ flex: 1, background: '#2a2a2a', border: '1px solid #333', color: '#fff', fontWeight: 'bold', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePhoto(showDeleteConfirm)}
                disabled={deletingPhoto === showDeleteConfirm}
                style={{ flex: 1, background: '#ef4444', border: 'none', color: '#fff', fontWeight: 'bold', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }}
              >
                {deletingPhoto === showDeleteConfirm ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MACRO EDIT MODAL */}
      {showMacroModal && selectedClient && macroData && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal + ' ' + styles.smallModal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Edit Macros for {selectedClient.full_name}</h2>
              <button onClick={() => setShowMacroModal(false)} className={styles.modalClose}>X</button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.macroInputsGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Protein (g)</label>
                  <input
                    type="number"
                    value={macroData.daily_protein_g}
                    onChange={(e) => setMacroData({ ...macroData, daily_protein_g: parseInt(e.target.value) || 0 })}
                    className={styles.numberInput}
                    min="0"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Carbs (g)</label>
                  <input
                    type="number"
                    value={macroData.daily_carbs_g}
                    onChange={(e) => setMacroData({ ...macroData, daily_carbs_g: parseInt(e.target.value) || 0 })}
                    className={styles.numberInput}
                    min="0"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Fats (g)</label>
                  <input
                    type="number"
                    value={macroData.daily_fats_g}
                    onChange={(e) => setMacroData({ ...macroData, daily_fats_g: parseInt(e.target.value) || 0 })}
                    className={styles.numberInput}
                    min="0"
                  />
                </div>
              </div>
              <div className={styles.calorieBox}>
                <p className={styles.calorieLabel}>Total Daily Calories (Auto-calculated)</p>
                <p className={styles.calorieValue}>
                  {calculateTotalCalories(macroData.daily_protein_g, macroData.daily_carbs_g, macroData.daily_fats_g)}
                </p>
                <p className={styles.calorieBreakdown}>
                  {macroData.daily_protein_g}g protein ({macroData.daily_protein_g * 4} cal) +{' '}
                  {macroData.daily_carbs_g}g carbs ({macroData.daily_carbs_g * 4} cal) +{' '}
                  {macroData.daily_fats_g}g fat ({macroData.daily_fats_g * 9} cal)
                </p>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button onClick={handleSaveMacros} className={styles.saveBtn}>Save Changes</button>
              <button onClick={() => setShowMacroModal(false)} className={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* COACHING NOTES MODAL */}
      {showNotesModal && selectedClient && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal + ' ' + styles.smallModal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Coaching Notes for {selectedClient.full_name}</h2>
              <button onClick={() => setShowNotesModal(false)} className={styles.modalClose}>X</button>
            </div>
            <div className={styles.modalContent}>
              <label className={styles.inputLabel}>Add your coaching notes here</label>
              <textarea
                value={coachingNotes}
                onChange={(e) => setCoachingNotes(e.target.value)}
                className={styles.notesTextarea}
                placeholder="Track progress, observations, adjustments needed, client feedback, etc..."
              />
              <p className={styles.charCount}>{coachingNotes.length} characters</p>
            </div>
            <div className={styles.modalActions}>
              <button
                onClick={handleSaveCoachingNotes}
                disabled={notesLoading}
                className={styles.saveBtn}
              >
                {notesLoading ? 'Saving...' : 'Save Notes'}
              </button>
              <button onClick={() => setShowNotesModal(false)} className={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* PLAN EDITOR MODAL */}
      {showPlanEditor && selectedClient && mealPlanData && macroData && (
        <PlanEditorModal
          client={selectedClient}
          mealPlanData={mealPlanData}
          macroData={macroData}
          onClose={() => {
            setShowPlanEditor(false)
            setSelectedCheckinForEdit(null)
          }}
          onSave={() => {
            setShowModal(false)
            fetchClients()
          }}
        />
      )}
      {/* ATTENTION QUEUE SIDEBAR */}
      <ClientAttentionQueue
        onClientClick={(client, tab) => {
          // Find the actual client object from your clients array
          const fullClient = clients.find(c => c.id === client.client_id)
          if (fullClient) {
            openClientDetails(fullClient)
            // Set the tab after a brief delay to let modal open
            setTimeout(() => setModalTab(tab), 150)
          }
        }}
      />
    </main>
  )
}



