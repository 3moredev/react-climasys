import React, { useState, useRef, useEffect } from 'react';
import { Delete, Close, ArrowDropDown } from '@mui/icons-material';
import { patientService } from '../services/patientService';
import { sessionService } from '../services/sessionService';
import { getMaxLength } from '../utils/validationUtils';

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
  patientAge: number;
  patientGender: string;
  initialSelectedGroups?: InstructionGroup[];
  onChange?: (selectedGroups: InstructionGroup[]) => void;
}

const InstructionGroupsPopup: React.FC<InstructionGroupsPopupProps> = ({
  isOpen,
  onClose,
  patientName,
  patientAge,
  patientGender,
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

  // Dynamic instruction groups fetched from backend
  const [instructionGroups, setInstructionGroups] = useState<InstructionGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load instruction groups when popup opens
  useEffect(() => {
    let cancelled = false;
    async function loadGroups() {
      if (!isOpen) return;
      setLoading(true);
      setError(null);
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
          setError(e?.message || 'Failed to load instruction groups');
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
    if (selectedGroupIds.length === 0) return;

    const newGroups = instructionGroups.filter(group =>
      selectedGroupIds.includes(group.id) &&
      !selectedGroups.some(selected => selected.id === group.id)
    );

    if (newGroups.length === 0) {
      console.log('No new groups to add from dropdown selection.');
      return;
    }

    const updatedGroups = [...selectedGroups, ...newGroups];
    console.log('Adding groups from dropdown to tables:', newGroups);
    setSelectedGroups(updatedGroups);
    setSelectedGroupIds([]);
    setIsGroupsOpen(false);

    // Notify parent component of the change
    if (onChange) {
      onChange(updatedGroups);
    }
  };

  const handleRemoveGroup = (groupId: string) => {
    const updatedGroups = selectedGroups.filter(g => g.id !== groupId);
    setSelectedGroups(updatedGroups);

    // Notify parent component of the change
    if (onChange) {
      onChange(updatedGroups);
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
          maxHeight: '92vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Roboto', sans-serif",
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'white',
          padding: '12px 20px 8px 20px',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ color: '#000000', fontWeight: 700, fontSize: '18px', fontFamily: "'Roboto', sans-serif" }}>
            {patientName} / {patientGender} / {patientAge} Y
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
              width: '36px',
              height: '36px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgb(25, 118, 210)';
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
          padding: '24px',
          paddingBottom: '60px',
          flex: 1,
          overflow: 'auto'
        }}>
          {/* Instruction Groups Selection */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#333333'
            }}>
              Instruction Groups
            </h3>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'end', marginBottom: '50px' }}>
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

                {isGroupsOpen && (
                  <div
                    ref={dropdownRef}
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #B7B7B7',
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      zIndex: 1000,
                      marginTop: '4px',
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
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                    <div style={{ flex: 1, overflowY: 'auto', padding: '4px 6px', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', columnGap: '8px', rowGap: '6px' }}>
                      {loading && (
                        <div style={{ padding: '6px', fontSize: '12px', color: '#777', gridColumn: '1 / -1', textAlign: 'center' }}>
                          Loading instruction groups...
                        </div>
                      )}
                      {error && !loading && (
                        <div style={{ padding: '6px', fontSize: '12px', color: '#d32f2f', gridColumn: '1 / -1', textAlign: 'center' }}>
                          {error}
                        </div>
                      )}
                      {filteredGroups.length === 0 && (
                        <div style={{ padding: '6px', fontSize: '12px', color: '#777', gridColumn: '1 / -1' }}>No instruction groups found</div>
                      )}
                      {filteredGroups.map((group) => (
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

            {/* Selected groups summary table */}
            {selectedGroups.length > 0 && (
              <div style={{ marginTop: '40px' }}>
                {/* <div style={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '4px 4px 0 0',
                  fontWeight: '600',
                  fontSize: '16px'
                }}>
                  Selected Groups
                </div> */}

                <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold', fontSize: '13px' }}>
                        <th style={{
                          padding: '6px',
                          textAlign: 'left',
                          fontWeight: 'bold',
                          backgroundColor: '#1976d2',
                          color: 'white',
                          borderRight: '1px solid rgba(255,255,255,0.2)',
                          width: 40
                        }}>
                          Sr.
                        </th>
                        <th style={{
                          padding: '6px',
                          textAlign: 'left',
                          fontWeight: 'bold',
                          backgroundColor: '#1976d2',
                          color: 'white',
                          borderRight: '1px solid rgba(255,255,255,0.2)'
                        }}>
                          Group
                        </th>
                        <th style={{
                          padding: '6px',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          backgroundColor: '#1976d2',
                          color: 'white',
                          width: 80
                        }}>
                          Action
                        </th>
                      </tr>
                    </thead>
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
                            borderRight: '1px solid #e0e0e0'
                          }} className='py-2'>
                            {index + 1}
                          </td>
                          <td style={{
                            color: '#333',
                            fontSize: '13px',
                            borderRight: '1px solid #e0e0e0'
                          }} className='py-2'>
                            {group.name}
                          </td>
                          <td style={{
                            textAlign: 'center'
                          }} className='py-2'>
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

            {/* Detailed instructions table */}
            {selectedGroups.length > 0 && (
              <div style={{ marginTop: '40px', marginBottom: '40px' }}>
                <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold', fontSize: '13px' }}>
                        <th style={{
                          padding: '6px',
                          textAlign: 'left',
                          fontWeight: 'bold',
                          backgroundColor: '#1976d2',
                          color: 'white',
                          borderRight: '1px solid rgba(255,255,255,0.2)',
                          width: 40
                        }}>
                          Sr.
                        </th>
                        <th style={{
                          padding: '6px',
                          textAlign: 'left',
                          fontWeight: 'bold',
                          backgroundColor: '#1976d2',
                          color: 'white',
                          borderRight: '1px solid rgba(255,255,255,0.2)',
                          width: 200
                        }}>
                          Group
                        </th>
                        <th style={{
                          padding: '6px',
                          textAlign: 'left',
                          fontWeight: 'bold',
                          backgroundColor: '#1976d2',
                          color: 'white'
                        }}>
                          Instructions
                        </th>
                      </tr>
                    </thead>
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
                            borderRight: '1px solid #e0e0e0'
                          }} className='py-2'>
                            {index + 1}
                          </td>
                          <td style={{
                            color: '#333',
                            fontSize: '13px',
                            borderRight: '1px solid #e0e0e0'
                          }} className='py-2'>
                            {group.name}
                          </td>
                          <td style={{
                            color: '#333',
                            fontSize: '13px'
                          }} className='py-2'>
                            {group.instructions}
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
          padding: '20px 24px',
          borderTop: '1px solid #F5F5F5',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#1976d2',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1565c0';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1976d2';
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionGroupsPopup;
