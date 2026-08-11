'use client'

import { useState } from 'react'

export default function ClientDetailsModal({ clientData, onClose, onUpdated }) {
  const { client, mealPlan, payments } = clientData
  const [editing, setEditing] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const [formData, setFormData] = useState({
    current_weight: client.current_weight,
    goal_weight: client.goal_weight,
    primary_goal: client.primary_goal,
    payment_status: client.payment_status,
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`/api/admin/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Client updated successfully')
        setMessageType('success')
        setEditing(false)
        setTimeout(() => {
          onUpdated()
        }, 1500)
      } else {
        setMessage(data.error || 'Failed to update client')
        setMessageType('error')
      }
    } catch (err) {
      setMessage('Error updating client')
      setMessageType('error')
      console.error(err)
    }
  }

  const handleRegenerateMealPlan = async () => {
  setRegenerating(true)
  setMessage('')

  try {
    const response = await fetch(`/api/admin/clients/${client.id}/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meal_pattern: client.meal_pattern || 'balanced',
      }),
    })


      const data = await response.json()

      if (response.ok) {
        setMessage('Meal plan regenerated and email sent to client!')
        setMessageType('success')
        setTimeout(() => {
          onUpdated()
        }, 2000)
      } else {
        setMessage(data.error || 'Failed to regenerate meal plan')
        setMessageType('error')
      }
    } catch (err) {
      setMessage('Error regenerating meal plan')
      setMessageType('error')
      console.error(err)
    }

    setRegenerating(false)
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch('/api/download-meal-plan-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: client.full_name,
          mealPlan: mealPlan,
        }),
      })

      if (!response.ok) {
        setMessage('Failed to generate PDF')
        setMessageType('error')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${client.full_name}-meal-plan.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setMessage('Error downloading PDF')
      setMessageType('error')
      console.error(err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold" style={{ color: '#FFD700' }}>
            {client.full_name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {message && (
          <div
            className={`mx-6 mt-6 p-4 rounded-lg ${
              messageType === 'success'
                ? 'bg-green-500/20 border border-green-500 text-green-400'
                : 'bg-red-500/20 border border-red-500 text-red-400'
            }`}
          >
            {message}
          </div>
        )}

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Client Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white font-semibold">{client.email}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white font-semibold">{client.phone || 'N/A'}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Age</p>
                <p className="text-white font-semibold">{client.age || 'N/A'}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Gender</p>
                <p className="text-white font-semibold">{client.gender || 'N/A'}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Height</p>
                <p className="text-white font-semibold">{client.height || 'N/A'}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Joined</p>
                <p className="text-white font-semibold">
                  {new Date(client.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Stats & Plan</h3>
              <button
                onClick={() => setEditing(!editing)}
                className="text-yellow-500 hover:text-yellow-400 text-sm font-semibold"
              >
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <label className="text-gray-400 text-sm block mb-2">
                  Current Weight (lbs)
                </label>
                {editing ? (
                  <input
                    type="number"
                    name="current_weight"
                    value={formData.current_weight}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                  />
                ) : (
                  <p className="text-white font-semibold">{formData.current_weight} lbs</p>
                )}
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <label className="text-gray-400 text-sm block mb-2">
                  Goal Weight (lbs)
                </label>
                {editing ? (
                  <input
                    type="number"
                    name="goal_weight"
                    value={formData.goal_weight}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                  />
                ) : (
                  <p className="text-white font-semibold">{formData.goal_weight} lbs</p>
                )}
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <label className="text-gray-400 text-sm block mb-2">Primary Goal</label>
                {editing ? (
                  <select
                    name="primary_goal"
                    value={formData.primary_goal}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                  >
                    <option>Lose Fat</option>
                    <option>Build Muscle</option>
                    <option>Maintain</option>
                  </select>
                ) : (
                  <p className="text-white font-semibold">{formData.primary_goal}</p>
                )}
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <label className="text-gray-400 text-sm block mb-2">Plan Type</label>
                <p className="text-white font-semibold">{client.plan_type?.toUpperCase()}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 col-span-2">
                <label className="text-gray-400 text-sm block mb-2">Payment Status</label>
                {editing ? (
                  <select
                    name="payment_status"
                    value={formData.payment_status}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                  >
                    <option>completed</option>
                    <option>pending</option>
                    <option>inactive</option>
                  </select>
                ) : (
                  <p className="text-white font-semibold">{formData.payment_status?.toUpperCase()}</p>
                )}
              </div>
            </div>

            {editing && (
              <button
                onClick={handleSaveChanges}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                Save Changes
              </button>
            )}
          </div>

          {mealPlan ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Current Meal Plan</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Calories</p>
                  <p className="text-2xl font-bold" style={{ color: '#FFD700' }}>
                    {mealPlan.target_calories}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Protein</p>
                  <p className="text-2xl font-bold" style={{ color: '#FFD700' }}>
                    {mealPlan.target_protein_g}g
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Carbs</p>
                  <p className="text-2xl font-bold" style={{ color: '#FFD700' }}>
                    {mealPlan.target_carbs_g}g
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Fats</p>
                  <p className="text-2xl font-bold" style={{ color: '#FFD700' }}>
                    {mealPlan.target_fats_g}g
                  </p>
                </div>
              </div>

              <p className="text-gray-400 text-sm">
                Generated: {new Date(mealPlan.created_at).toLocaleDateString()}
              </p>

              <div className="flex gap-4">
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                  Download PDF
                </button>
                <button
                  onClick={handleRegenerateMealPlan}
                  disabled={regenerating}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-black font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                  {regenerating ? 'Regenerating...' : 'Regenerate Plan'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-gray-400">No meal plan generated yet</p>
            </div>
          )}

          {payments && payments.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Payment History</h3>
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div key={payment.id} className="bg-gray-800 rounded-lg p-4 flex justify-between">
                    <div>
                      <p className="text-white font-semibold">{payment.plan_type?.toUpperCase()}</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        ${payment.amount.toFixed(2)}
                      </p>
                      <p
                        className="text-sm font-semibold"
                        style={{
                          color: payment.status === 'completed' ? '#10b981' : '#f59e0b',
                        }}
                      >
                        {payment.status?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Notes</h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-300">
                {client.other_notes || 'No additional notes'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
