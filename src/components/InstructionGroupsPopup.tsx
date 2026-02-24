import React, { useState, useRef, useEffect } from 'react';
import { Delete, Close, ArrowDropDown } from '@mui/icons-material';
import { patientService } from '../services/patientService';
import { sessionService } from '../services/sessionService';
import { getMaxLength } from '../utils/validationUtils';
import { Alert, Snackbar, Button, Box, Typography } from '@mui/material';

export interface InstructionGroup {
  id: string;
  name: string;
  nameHindi: string;
  instructions: string;
}

interface InstructionGroupsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientAge: string | number;
  patientGender: string;
  patientContact: string;
  initialSelectedGroups?: InstructionGroup[];
  onChange?: (selectedGroups: InstructionGroup[]) => void;
  onSave?: (groups: InstructionGroup[]) => void;
}

const InstructionGroupsPopup: React.FC<InstructionGroupsPopupProps> = ({
  isOpen,
  onClose,
  patientName,
  patientAge,
  patientGender,
  patientContact,
  initialSelectedGroups = [],
  onChange
}) => {
  // Debug: Log received props (reduced verbosity)
  // console.log('=== INSTRUCTION GROUPS POPUP: Received Props ===');
  // console.log('isOpen:', isOpen);
  // console.log('initialSelectedGroups length:', initialSelectedGroups?.length || 0);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<InstructionGroup[]>(initialSelectedGroups);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isGroupsOpen, setIsGroupsOpen] = useState(false);
  const [showSelectedTable, setShowSelectedTable] = useState(false);
  const groupsRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const prevOpenRef = useRef<boolean>(false);

  // Dynamic instruction groups fetched from backend
  const [instructionGroups, setInstructionGroups] = useState<InstructionGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    instructionGroups: string;
    searchTerm: string;
  }>({
    instructionGroups: '',
    searchTerm: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error');
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Load instruction groups when popup opens
  useEffect(() => {
    let cancelled = false;
    async function loadGroups() {
      if (!isOpen) return;
      setLoading(true);
      setErrors(prev => ({ ...prev, instructionGroups: '' }));
      try {
        // Get session for doctor/clinic
        const session = await sessionService.getSessionInfo();
        const doctorId = session?.data?.doctorId || '';
        const clinicId = session?.data?.clinicId || '';
        if (!doctorId || !clinicId) {
          throw new Error('Missing doctor or clinic context');
        }
        const data = await patientService.getPatientProfileRefData(doctorId, clinicId);
        console.log('Instruction groups data:', data);
        const raw = (data as any)?.InstructionGroups || (data as any)?.instructionGroups || [];
        const mapped: InstructionGroup[] = Array.isArray(raw)
          ? raw.map((g: any, idx: number) => {
            const groupDesc = g?.group_description ?? g?.groupDescription ?? g?.groupName ?? g?.name;
            const instrList = g?.instructions_description;
            const instrText = Array.isArray(instrList)
              ? instrList.map((s: any) => String(s)).join(' ')
              : (g?.instructions ?? g?.instructionText ?? g?.text ?? g?.instructions_description ?? '');
            return {
              id: String(g?.id ?? g?.groupId ?? idx + 1),
              name: String(groupDesc ?? 'Group').toUpperCase(),
              nameHindi: String(g?.nameHindi ?? g?.hindiName ?? g?.name_hi ?? ''),
              instructions: String(instrText)
            };
          })
          : [];
        if (!cancelled) {
          const normalize = (value: string) => value.trim().toUpperCase();
          console.log('Instruction groups mapped for dropdown:', mapped);
          setInstructionGroups(mapped);
          if (initialSelectedGroups && initialSelectedGroups.length > 0) {
            const matchedIds = mapped
              .filter(group => {
                const normalizedGroupName = normalize(group.name || '');
                return initialSelectedGroups.some(selected =>
                  normalize(selected.name || '') === normalizedGroupName
                );
              })
              .map(group => group.id);
            if (matchedIds.length > 0) {
              console.log('Matched dropdown IDs for initial selections:', matchedIds);
              setSelectedGroupIds(matchedIds);
            } else {
              console.log('No dropdown matches found for initial selections');
              setSelectedGroupIds([]);
            }
          } else {
            // Don't reset selections when we already have user selections
            setSelectedGroupIds([]);
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          setInstructionGroups([]);
          setErrors(prev => ({ ...prev, instructionGroups: e?.message || 'Failed to load instruction groups' }));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadGroups();
    return () => { cancelled = true; };
  }, [isOpen, initialSelectedGroups]);

  // Sync initialSelectedGroups when popup opens (these are saved instructions from master-lists API)
  useEffect(() => {
    console.log('=== POPUP: Sync useEffect triggered ===');
    console.log('isOpen:', isOpen);
    console.log('initialSelectedGroups:', initialSelectedGroups);
    console.log('initialSelectedGroups length:', initialSelectedGroups?.length || 0);
    console.log('instructionGroups length:', instructionGroups.length);
    console.log('Current selectedGroups state:', selectedGroups);

    if (isOpen) {
      // Only reset snackbar and errors when the popup is FIRST opened
      if (!prevOpenRef.current) {
        setShowSnackbar(false);
        setErrorMessage('');
        setErrors({ instructionGroups: '', searchTerm: '' });
      }

      if (initialSelectedGroups && initialSelectedGroups.length > 0) {
        // Display saved instructions from master-lists API in the tables
        console.log('✅ POPUP: Setting selectedGroups from initialSelectedGroups');
        console.log('initialSelectedGroups to set:', JSON.stringify(initialSelectedGroups, null, 2));
        setSelectedGroups(initialSelectedGroups);
        console.log('✅ POPUP: selectedGroups state has been SET');

        // Sync dropdown selection with loaded instruction groups if possible
        const normalize = (value: string) => value.trim().toUpperCase();
        const matchedIds = instructionGroups
          .filter(group => {
            const normalizedGroupName = normalize(group.name || '');
            return initialSelectedGroups.some(selected =>
              normalize(selected.name || '') === normalizedGroupName
            );
          })
          .map(group => group.id);
        console.log('Matched dropdown IDs:', matchedIds);
        if (matchedIds.length > 0) {
          console.log('✅ POPUP: Set selectedGroupIds to matched IDs');
          setSelectedGroupIds(matchedIds);
        } else {
          // Fallback: clear dropdown selection
          console.log('⚠️ POPUP: No matching dropdown groups found, cleared selectedGroupIds');
          setSelectedGroupIds([]);
        }
      } else {
        // No saved instructions, clear everything
        console.warn('⚠️ POPUP: initialSelectedGroups is empty, clearing selectedGroups');
        setSelectedGroups([]);
        setSelectedGroupIds([]);
      }
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, initialSelectedGroups, instructionGroups]);

  const filteredGroups = instructionGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.nameHindi.includes(searchTerm)
  );

  // Selected options for chip-like preview inside dropdown
  const selectedOptions = instructionGroups.filter(group => selectedGroupIds.includes(group.id));

  // Close dropdown on outside click (but not on scroll)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!isGroupsOpen) return;
      const target = e.target as Node;
      // Close if click is outside the groups container (which includes both trigger and dropdown)
      if (groupsRef.current && !groupsRef.current.contains(target)) {
        setIsGroupsOpen(false);
      }
    };

    const onWheel = (e: WheelEvent) => {
      // Prevent closing dropdown when scrolling inside it
      if (!isGroupsOpen) return;
      const target = e.target as Node;
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        e.stopPropagation();
      }
    };

    document.addEventListener('mousedown', onClick);
    document.addEventListener('wheel', onWheel, true);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('wheel', onWheel, true);
    };
  }, [isGroupsOpen]);

  const handleGroupSelect = (group: InstructionGroup) => {
    if (selectedGroupIds.includes(group.id)) {
      console.log('Deselecting group from dropdown:', group);
      setSelectedGroupIds(selectedGroupIds.filter(id => id !== group.id));
      setSelectedGroups(selectedGroups.filter(g => g.id !== group.id));
    } else {
      console.log('Selecting group from dropdown:', group);
      setSelectedGroupIds([...selectedGroupIds, group.id]);
      setSelectedGroups([...selectedGroups, group]);
    }
  };

  const handleAddGroups = () => {
    if (selectedGroupIds.length === 0) {
      setErrors(prev => ({ ...prev, instructionGroups: 'Please select at least one group' }));
      return;
    }

    const newGroups = instructionGroups.filter(
      group => selectedGroupIds.includes(group.id) &&
        !selectedGroups.some(selected => selected.id === group.id)
    );

    if (newGroups.length === 0) {
      setErrors(prev => ({ ...prev, instructionGroups: 'These groups are already added' }));
      return;
    }

    const updatedGroups = [...selectedGroups, ...newGroups];
    setSelectedGroups(updatedGroups);
    setSelectedGroupIds([]);
    setIsGroupsOpen(false);
    setErrors(prev => ({ ...prev, instructionGroups: '' })); // Clear error on success

    if (onChange) onChange(updatedGroups);
  };
  const handleRemoveGroup = (groupId: string) => {
    const updatedGroups = selectedGroups.filter(g => g.id !== groupId);
    setSelectedGroups(updatedGroups);

    // Notify parent component of the change
    if (onChange) {
      onChange(updatedGroups);
    }
  };

  const handleSubmit = () => {
    // Include any currently checked dropdown items not yet added
    const pendingGroups = instructionGroups.filter(group =>
      selectedGroupIds.includes(group.id) &&
      !selectedGroups.some(g => g.id === group.id)
    );

    const finalGroups = [...selectedGroups, ...pendingGroups];

    if (finalGroups.length === 0) {
      setErrors(prev => ({ ...prev, instructionGroups: 'Please select at least one group' }));
      return;
    }

    // Update state and notify parent
    setSelectedGroups(finalGroups);
    if (onChange) onChange(finalGroups);

    // Show success message before closing
    setErrorMessage('Instructions added successfully');
    setSnackbarSeverity('success');
    setShowSnackbar(true);

    // Delay closing to let user see success message
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleReset = () => {
    setSelectedGroups([]);
    setSelectedGroupIds([]);
    setSearchTerm('');
    setErrors({ instructionGroups: '', searchTerm: '' }); // Clear errors on reset

    if (onChange) {
      onChange([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100000
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          width: '95%',
          maxWidth: '800px',
          maxHeight: '89vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Roboto', 'Nirmala UI', 'Noto Sans Devanagari', 'Arial', sans-serif",
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'white',
          padding: '20px 20px 10px 20px',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#000000',
              lineHeight: '1.2'
            }}>
              Instruction
            </div>
            <div style={{
              color: '#4caf50',
              fontWeight: 500,
              fontSize: '14px',
              fontFamily: "'Roboto', sans-serif",
              textDecoration: 'underline',
              width: 'fit-content'
            }}>
              {patientName} / {patientGender} / {patientAge} / {patientContact}
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              background: 'rgb(25, 118, 210)',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '18px',
              width: '32px', // Slightly smaller close button to match reference feel
              height: '32px',
              transition: 'background-color 0.2s',
              marginTop: '-4px' // Adjust for header padding
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgb(21, 101, 192)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgb(25, 118, 210)';
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '20px',
          paddingBottom: '0px',
          flex: 1,
          overflow: 'auto'
        }}>
          {/* Instruction Groups Selection */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#333',
              marginBottom: '8px'
            }}>
              Instruction Group
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div ref={groupsRef} style={{ position: 'relative', flex: 1 }}>
                <div
                  onClick={() => setIsGroupsOpen(prev => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: '40px',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <span style={{ color: selectedGroupIds.length ? '#000' : '#9e9e9e' }}>
                    {selectedGroupIds.length === 0 && 'Select Instruction Groups'}
                    {selectedGroupIds.length === 1 && '1 selected'}
                    {selectedGroupIds.length > 1 && `${selectedGroupIds.length} selected`}
                  </span>
                  <ArrowDropDown
                    style={{
                      marginLeft: '8px',
                      color: '#666',
                      fontSize: '24px',
                      transition: 'transform 0.2s',
                      transform: isGroupsOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                </div>

                {errors.instructionGroups && (
                  <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>
                    {errors.instructionGroups}
                  </div>
                )}

                {isGroupsOpen && (
                  <div
                    ref={dropdownRef}
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: '40px', // Fixed height of the toggle box to ensure no gap and cover errors
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #B7B7B7',
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      zIndex: 1000,
                      marginTop: '0px', // Removed gap
                      maxHeight: '350px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ padding: '6px', position: 'relative' }}>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                          const val = e.target.value;
                          const limit = getMaxLength('groupDescription') || 50;
                          if (val.length <= limit) {
                            setSearchTerm(val);
                            if (val.length === limit) {
                              setErrors(prev => ({ ...prev, searchTerm: `Instruction Group Search cannot exceed ${limit} characters` }));
                            } else {
                              setErrors(prev => ({ ...prev, searchTerm: '' }));
                            }
                          }
                        }}
                        maxLength={getMaxLength('groupDescription') || 50}
                        placeholder="Search instruction groups"
                        style={{
                          width: '100%',
                          height: '32px',
                          padding: '6px 30px 6px 8px',
                          border: '1px solid #B7B7B7',
                          borderRadius: '4px',
                          fontSize: '12px',
                          outline: 'none'
                        }}
                      />
                      {searchTerm && (
                        <div
                          onClick={() => setSearchTerm('')}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            color: '#000',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Close sx={{ fontSize: 16 }} />
                        </div>
                      )}
                    </div>
                    {/* Selected groups chips (preview) */}
                    {selectedOptions.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '6px', paddingTop: 0, maxHeight: '100px', overflowY: 'auto' }}>
                        {selectedOptions.map((group) => (
                          <label key={`chip-${group.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', backgroundColor: '#eeeeee', borderRadius: '6px', fontSize: '12px', border: '1px solid #e0e0e0' }}>
                            <input
                              type="checkbox"
                              checked
                              onChange={() => {
                                setSelectedGroupIds(prev => prev.filter(id => id !== group.id));
                              }}
                              style={{ margin: 0, maxWidth: 16 }}
                            />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{group.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    <div style={{ padding: '6px' }}>
                      {errors.searchTerm && (
                        <div style={{
                          color: errors.searchTerm.toLowerCase().includes('cannot exceed') ? '#666' : '#d32f2f',
                          fontSize: '12px',
                          marginBottom: '4px',
                          lineHeight: '1.2',
                          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                        }}>
                          {errors.searchTerm}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '4px 6px', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', columnGap: '8px', rowGap: '6px' }}>
                      {loading && (
                        <div style={{ padding: '6px', fontSize: '12px', color: '#777', gridColumn: '1 / -1', textAlign: 'center' }}>
                          Loading instruction groups...
                        </div>
                      )}
                      {!errors.searchTerm && filteredGroups.length === 0 && (
                        <div style={{ padding: '6px', fontSize: '12px', color: '#777', gridColumn: '1 / -1' }}>No instruction groups found</div>
                      )}
                      {!errors.searchTerm && filteredGroups.map((group) => (
                        <label key={group.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 2px', cursor: 'pointer', fontSize: '12px', border: 'none' }}>
                          <input
                            type="checkbox"
                            checked={selectedGroupIds.includes(group.id)}
                            onChange={(e) => {
                              setSelectedGroupIds(prev => {
                                if (e.target.checked) {
                                  if (prev.includes(group.id)) return prev;
                                  return [...prev, group.id];
                                } else {
                                  return prev.filter(id => id !== group.id);
                                }
                              });
                              setErrors(prev => ({ ...prev, instructionGroups: '' }));
                            }}
                            style={{ margin: 0, maxWidth: 16 }}
                          />
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '500', color: '#333333' }}>
                              {group.name}
                            </div>
                            <div style={{ fontSize: '10px', color: '#666666' }}>
                              {group.nameHindi}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleAddGroups}
                style={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1565c0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1976d2';
                }}
              >
                Add
              </button>
            </div>

            {/* Combined Selected Groups and Instructions table */}
            {selectedGroups.length > 0 && (
              <div style={{ marginTop: '40px', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                {/* Header Table */}
                <div style={{ backgroundColor: '#1976d2', paddingRight: '16px' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'separate',
                    borderSpacing: 0,
                    tableLayout: 'fixed',
                    fontFamily: "inherit"
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold', fontSize: '13px' }}>
                        <th style={{
                          padding: '10px 6px',
                          textAlign: 'left',
                          width: '50px',
                          borderRight: '1px solid rgba(255,255,255,0.2)'
                        }}>
                          Sr.
                        </th>
                        <th style={{
                          padding: '10px 6px',
                          textAlign: 'left',
                          width: '150px',
                          borderRight: '1px solid rgba(255,255,255,0.2)'
                        }}>
                          Group
                        </th>
                        <th style={{
                          padding: '10px 6px',
                          textAlign: 'left',
                          borderRight: '1px solid rgba(255,255,255,0.2)'
                        }}>
                          Instructions
                        </th>
                        <th style={{
                          padding: '10px 6px',
                          textAlign: 'center',
                          width: '80px'
                        }}>
                          Action
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>

                {/* Scrollable Body Table */}
                <div style={{
                  maxHeight: '274px',
                  overflowY: 'auto',
                  backgroundColor: '#fff'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'separate',
                    borderSpacing: 0,
                    tableLayout: 'fixed',
                    fontFamily: "inherit"
                  }}>
                    <tbody>
                      {selectedGroups.map((group, index) => (
                        <tr
                          key={group.id}
                          style={{
                            borderBottom: '1px solid #e0e0e0',
                            backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#f5f5f5';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLTableRowElement).style.backgroundColor = index % 2 === 0 ? '#f8f9fa' : 'white';
                          }}
                        >
                          <td style={{
                            color: '#333',
                            fontSize: '13px',
                            borderRight: '1px solid #e0e0e0',
                            padding: '12px 6px',
                            width: '50px',
                            wordBreak: 'break-word'
                          }}>
                            {index + 1}
                          </td>
                          <td style={{
                            color: '#333',
                            fontSize: '13px',
                            borderRight: '1px solid #e0e0e0',
                            padding: '12px 6px',
                            width: '150px',
                            wordBreak: 'break-word'
                          }}>
                            {group.name}
                          </td>
                          <td style={{
                            color: '#333',
                            fontSize: '13px',
                            borderRight: '1px solid #e0e0e0',
                            padding: '12px 6px',
                            wordBreak: 'break-word'
                          }}>
                            {group.instructions}
                          </td>
                          <td style={{
                            textAlign: 'center',
                            padding: '12px 6px',
                            width: '80px'
                          }}>
                            <div
                              onClick={() => handleRemoveGroup(group.id)}
                              title="Remove"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '24px',
                                height: '24px',
                                cursor: 'pointer',
                                color: '#000000',
                                backgroundColor: 'transparent'
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLDivElement).style.color = '#EF5350';
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLDivElement).style.color = '#000000';
                              }}
                            >
                              <Delete fontSize="small" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid #F5F5F5',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              backgroundColor: 'rgb(0, 123, 255)',
              textTransform: 'none',
              height: '38px',
              padding: '8px 24px',
              '&:hover': {
                backgroundColor: 'rgb(0, 100, 200)',
              }
            }}
          >
            Close
          </Button>
          <Button
            onClick={handleReset}
            variant="contained"
            sx={{
              backgroundColor: 'rgb(0, 123, 255)',
              textTransform: 'none',
              height: '38px',
              padding: '8px 24px',
              '&:hover': {
                backgroundColor: 'rgb(0, 100, 200)',
              }
            }}
          >
            Reset
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              backgroundColor: 'rgb(0, 123, 255)',
              textTransform: 'none',
              height: '38px',
              padding: '8px 24px',
              '&:hover': {
                backgroundColor: 'rgb(0, 100, 200)',
              }
            }}
          >
            Submit
          </Button>
        </div>
        <Snackbar
          open={showSnackbar}
          autoHideDuration={4000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{ zIndex: 110000 }} // Higher than the modal's 100000
        >
          <Alert
            onClose={() => setShowSnackbar(false)}
            severity={snackbarSeverity}
            variant="filled"
            sx={{
              width: '100%',
              fontWeight: 'bold',
              backgroundColor: snackbarSeverity === 'success' ? '#4caf50' : '#d32f2f'
            }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default InstructionGroupsPopup;
