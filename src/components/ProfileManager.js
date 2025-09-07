'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  Building2, 
  Palette, 
  CreditCard, 
  FileText, 
  Save,
  Plus,
  Edit3,
  Trash2,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export const DEFAULT_PROFILE = {
  id: 'default',
  name: 'Standardprofil',
  companyName: 'Beispiel GmbH',
  primaryColor: '#007AFF',
  secondaryColor: '#5856D6',
  logo: null,
  address: 'Musterstraße 1\n10115 Berlin',
  phone: '+49 30 1234567',
  email: 'hello@beispiel.de',
  website: 'beispiel.de',
  bankDetails: {
    bank: 'Deutsche Musterbank',
    iban: 'DE89 3704 0044 0532 0130 00',
    bic: 'COBADEFFXXX'
  },
  taxId: 'DE123456789',
  preferences: {
    tone: 'professionell und freundlich',
    structure: 'detailliert mit Tabellen',
    paymentTerms: '14 Tage netto',
    validityPeriod: '30 Tage',
    defaultDiscount: '0',
    includeTerms: true,
    customInstructions: ''
  }
}

const COLOR_PRESETS = [
  { name: 'iOS Blau', primary: '#007AFF', secondary: '#5856D6' },
  { name: 'Grün', primary: '#34C759', secondary: '#30D158' },
  { name: 'Orange', primary: '#FF9500', secondary: '#FF9F0A' },
  { name: 'Rot', primary: '#FF3B30', secondary: '#FF453A' },
  { name: 'Lila', primary: '#AF52DE', secondary: '#BF5AF2' },
  { name: 'Grau', primary: '#8E8E93', secondary: '#636366' },
]

export function ProfileManager({ onProfileSelect, selectedProfile, isOpen, onClose }) {
  const [profiles, setProfiles] = useState([DEFAULT_PROFILE])
  const [editingProfile, setEditingProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('company')
  const [isSaving, setIsSaving] = useState(false)

  // Profiles aus LocalStorage laden
  useEffect(() => {
    const savedProfiles = localStorage.getItem('angebote-profiles')
    if (savedProfiles) {
      try {
        const parsed = JSON.parse(savedProfiles)
        setProfiles([DEFAULT_PROFILE, ...parsed])
      } catch (error) {
        console.error('Fehler beim Laden der Profile:', error)
      }
    }
  }, [])

  // Profile speichern
  const saveProfiles = (newProfiles) => {
    const filteredProfiles = newProfiles.filter(p => p.id !== 'default')
    localStorage.setItem('angebote-profiles', JSON.stringify(filteredProfiles))
    setProfiles([DEFAULT_PROFILE, ...filteredProfiles])
  }

  // Neues Profil erstellen
  const createProfile = () => {
    const newProfile = {
      ...DEFAULT_PROFILE,
      id: `profile-${Date.now()}`,
      name: 'Neues Profil',
      companyName: 'Neues Unternehmen'
    }
    setEditingProfile(newProfile)
    setActiveTab('company')
  }

  // Profil bearbeiten
  const editProfile = (profile) => {
    setEditingProfile({ ...profile })
    setActiveTab('company')
  }

  // Profil speichern
  const saveProfile = async () => {
    if (!editingProfile) return
    
    setIsSaving(true)
    
    // Simuliere Speicher-Delay für bessere UX
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const updatedProfiles = profiles.map(p => 
      p.id === editingProfile.id ? editingProfile : p
    )
    
    if (!profiles.find(p => p.id === editingProfile.id)) {
      updatedProfiles.push(editingProfile)
    }
    
    saveProfiles(updatedProfiles)
    setEditingProfile(null)
    setIsSaving(false)
  }

  // Profil löschen
  const deleteProfile = (profileId) => {
    if (profileId === 'default') return
    const updatedProfiles = profiles.filter(p => p.id !== profileId)
    saveProfiles(updatedProfiles)
    
    if (selectedProfile?.id === profileId) {
      onProfileSelect(DEFAULT_PROFILE)
    }
  }

  // Input-Komponente
  const Input = ({ label, value, onChange, placeholder, textarea = false, ...props }) => {
    const Component = textarea ? 'textarea' : 'input'
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-ios-gray-700">{label}</label>
        <Component
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-ios-gray-300 rounded-ios focus:ring-2 focus:ring-ios-blue focus:border-transparent transition-all"
          rows={textarea ? 3 : undefined}
          {...props}
        />
      </div>
    )
  }

  // Color Picker
  const ColorPicker = ({ label, value, onChange }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-ios-gray-700">{label}</label>
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded-ios border border-ios-gray-300 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-ios-gray-300 rounded-ios focus:ring-2 focus:ring-ios-blue focus:border-transparent"
          placeholder="#007AFF"
        />
      </div>
    </div>
  )

  const tabs = [
    { id: 'company', label: 'Unternehmen', icon: Building2 },
    { id: 'colors', label: 'Design', icon: Palette },
    { id: 'banking', label: 'Banking', icon: CreditCard },
    { id: 'preferences', label: 'Einstellungen', icon: FileText },
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-ios-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-ios-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-ios-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-ios-blue" />
                <h2 className="text-xl font-semibold text-ios-gray-900">
                  Profile verwalten
                </h2>
              </div>
              <Button onClick={onClose} variant="ghost" size="sm">
                ✕
              </Button>
            </div>
          </div>

          <div className="flex h-[70vh]">
            {/* Sidebar */}
            <div className="w-80 border-r border-ios-gray-200 p-4 overflow-y-auto">
              <div className="space-y-3">
                <Button
                  onClick={createProfile}
                  className="w-full justify-start"
                  variant="secondary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Neues Profil erstellen
                </Button>

                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={cn(
                      'p-3 rounded-ios border cursor-pointer transition-all',
                      selectedProfile?.id === profile.id
                        ? 'border-ios-blue bg-blue-50'
                        : 'border-ios-gray-200 hover:border-ios-gray-300'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex-1"
                        onClick={() => onProfileSelect(profile)}
                      >
                        <h4 className="font-medium text-ios-gray-900">
                          {profile.name}
                        </h4>
                        <p className="text-sm text-ios-gray-600">
                          {profile.companyName}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          onClick={() => editProfile(profile)}
                          variant="ghost"
                          size="sm"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        {profile.id !== 'default' && (
                          <Button
                            onClick={() => deleteProfile(profile.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {editingProfile ? (
                <div className="p-6">
                  {/* Tabs */}
                  <div className="flex space-x-1 mb-6 bg-ios-gray-100 p-1 rounded-ios">
                    {tabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={cn(
                            'flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-ios transition-all text-sm font-medium',
                            activeTab === tab.id
                              ? 'bg-white text-ios-blue shadow-sm'
                              : 'text-ios-gray-600 hover:text-ios-gray-900'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Tab Content */}
                  <div className="space-y-6">
                    {activeTab === 'company' && (
                      <div className="space-y-4">
                        <Input
                          label="Profil Name"
                          value={editingProfile.name}
                          onChange={(value) => setEditingProfile({
                            ...editingProfile,
                            name: value
                          })}
                          placeholder="Mein Profil"
                        />
                        <Input
                          label="Firmenname"
                          value={editingProfile.companyName}
                          onChange={(value) => setEditingProfile({
                            ...editingProfile,
                            companyName: value
                          })}
                          placeholder="Ihr Unternehmen GmbH"
                        />
                        <Input
                          label="Adresse"
                          value={editingProfile.address}
                          onChange={(value) => setEditingProfile({
                            ...editingProfile,
                            address: value
                          })}
                          placeholder="Straße Hausnummer&#10;PLZ Ort"
                          textarea
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Telefon"
                            value={editingProfile.phone}
                            onChange={(value) => setEditingProfile({
                              ...editingProfile,
                              phone: value
                            })}
                            placeholder="+49 123 456789"
                          />
                          <Input
                            label="E-Mail"
                            value={editingProfile.email}
                            onChange={(value) => setEditingProfile({
                              ...editingProfile,
                              email: value
                            })}
                            placeholder="info@unternehmen.de"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Website"
                            value={editingProfile.website}
                            onChange={(value) => setEditingProfile({
                              ...editingProfile,
                              website: value
                            })}
                            placeholder="www.unternehmen.de"
                          />
                          <Input
                            label="Steuernummer"
                            value={editingProfile.taxId}
                            onChange={(value) => setEditingProfile({
                              ...editingProfile,
                              taxId: value
                            })}
                            placeholder="DE123456789"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'colors' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <ColorPicker
                            label="Primärfarbe"
                            value={editingProfile.primaryColor}
                            onChange={(value) => setEditingProfile({
                              ...editingProfile,
                              primaryColor: value
                            })}
                          />
                          <ColorPicker
                            label="Sekundärfarbe"
                            value={editingProfile.secondaryColor}
                            onChange={(value) => setEditingProfile({
                              ...editingProfile,
                              secondaryColor: value
                            })}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-ios-gray-700 mb-3 block">
                            Vorgefertigte Farbkombinationen
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {COLOR_PRESETS.map((preset) => (
                              <button
                                key={preset.name}
                                onClick={() => setEditingProfile({
                                  ...editingProfile,
                                  primaryColor: preset.primary,
                                  secondaryColor: preset.secondary
                                })}
                                className="p-3 border border-ios-gray-200 rounded-ios hover:border-ios-gray-300 transition-all"
                              >
                                <div className="flex space-x-2 mb-2">
                                  <div 
                                    className="w-6 h-6 rounded-full"
                                    style={{ backgroundColor: preset.primary }}
                                  />
                                  <div 
                                    className="w-6 h-6 rounded-full"
                                    style={{ backgroundColor: preset.secondary }}
                                  />
                                </div>
                                <span className="text-xs text-ios-gray-600">
                                  {preset.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'banking' && (
                      <div className="space-y-4">
                        <Input
                          label="Bank"
                          value={editingProfile.bankDetails.bank}
                          onChange={(value) => setEditingProfile({
                            ...editingProfile,
                            bankDetails: {
                              ...editingProfile.bankDetails,
                              bank: value
                            }
                          })}
                          placeholder="Musterbank"
                        />
                        <Input
                          label="IBAN"
                          value={editingProfile.bankDetails.iban}
                          onChange={(value) => setEditingProfile({
                            ...editingProfile,
                            bankDetails: {
                              ...editingProfile.bankDetails,
                              iban: value
                            }
                          })}
                          placeholder="DE12 3456 7890 1234 5678 90"
                        />
                        <Input
                          label="BIC"
                          value={editingProfile.bankDetails.bic}
                          onChange={(value) => setEditingProfile({
                            ...editingProfile,
                            bankDetails: {
                              ...editingProfile.bankDetails,
                              bic: value
                            }
                          })}
                          placeholder="MUSTDE2MXXX"
                        />
                      </div>
                    )}

                    {activeTab === 'preferences' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-ios-gray-700">
                              Tonfall
                            </label>
                            <select
                              value={editingProfile.preferences.tone}
                              onChange={(e) => setEditingProfile({
                                ...editingProfile,
                                preferences: {
                                  ...editingProfile.preferences,
                                  tone: e.target.value
                                }
                              })}
                              className="w-full px-3 py-2 border border-ios-gray-300 rounded-ios focus:ring-2 focus:ring-ios-blue focus:border-transparent"
                            >
                              <option value="professionell und freundlich">Professionell und freundlich</option>
                              <option value="formal und sachlich">Formal und sachlich</option>
                              <option value="locker und persönlich">Locker und persönlich</option>
                              <option value="vertrauensvoll und kompetent">Vertrauensvoll und kompetent</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-ios-gray-700">
                              Struktur
                            </label>
                            <select
                              value={editingProfile.preferences.structure}
                              onChange={(e) => setEditingProfile({
                                ...editingProfile,
                                preferences: {
                                  ...editingProfile.preferences,
                                  structure: e.target.value
                                }
                              })}
                              className="w-full px-3 py-2 border border-ios-gray-300 rounded-ios focus:ring-2 focus:ring-ios-blue focus:border-transparent"
                            >
                              <option value="detailliert mit Tabellen">Detailliert mit Tabellen</option>
                              <option value="kompakt und übersichtlich">Kompakt und übersichtlich</option>
                              <option value="ausführlich mit Beschreibungen">Ausführlich mit Beschreibungen</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Zahlungsziel"
                            value={editingProfile.preferences.paymentTerms}
                            onChange={(value) => setEditingProfile({
                              ...editingProfile,
                              preferences: {
                                ...editingProfile.preferences,
                                paymentTerms: value
                              }
                            })}
                            placeholder="14 Tage netto"
                          />
                          <Input
                            label="Gültigkeitsdauer"
                            value={editingProfile.preferences.validityPeriod}
                            onChange={(value) => setEditingProfile({
                              ...editingProfile,
                              preferences: {
                                ...editingProfile.preferences,
                                validityPeriod: value
                              }
                            })}
                            placeholder="30 Tage"
                          />
                        </div>
                        <Input
                          label="Zusätzliche Anweisungen für KI"
                          value={editingProfile.preferences.customInstructions}
                          onChange={(value) => setEditingProfile({
                            ...editingProfile,
                            preferences: {
                              ...editingProfile.preferences,
                              customInstructions: value
                            }
                          })}
                          placeholder="Spezielle Anforderungen oder Hinweise für die Angebotserstellung..."
                          textarea
                        />
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end mt-8 pt-6 border-t border-ios-gray-200">
                    <Button
                      onClick={saveProfile}
                      loading={isSaving}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Profil speichern
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-ios-gray-500">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Wähle ein Profil aus oder erstelle ein neues Profil</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
