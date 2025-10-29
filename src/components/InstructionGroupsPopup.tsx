import React, { useState, useRef, useEffect } from 'react';
import { Close, Search, Delete, Add } from '@mui/icons-material';

interface InstructionGroup {
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
}

const InstructionGroupsPopup: React.FC<InstructionGroupsPopupProps> = ({
  isOpen,
  onClose,
  patientName,
  patientAge,
  patientGender
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<InstructionGroup[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isGroupsOpen, setIsGroupsOpen] = useState(false);
  const [showSelectedTable, setShowSelectedTable] = useState(false);
  const groupsRef = useRef<HTMLDivElement | null>(null);

  // Static instruction groups data matching the reference image
  const instructionGroups: InstructionGroup[] = [
    {
      id: '1',
      name: 'DIABETIC',
      nameHindi: 'मधुमेह',
      instructions: 'Monitor blood sugar levels regularly. Take medications as prescribed. Follow diabetic diet. Exercise regularly. Check feet daily for any cuts or sores.'
    },
    {
      id: '2',
      name: 'HYPERTENSIVE',
      nameHindi: 'उच्च रक्तचाप',
      instructions: 'Take blood pressure medication as prescribed. Monitor blood pressure daily. Reduce salt intake. Exercise regularly. Avoid stress and get adequate sleep.'
    },
    {
      id: '3',
      name: 'CARDIAC',
      nameHindi: 'हृदय रोग',
      instructions: 'Take cardiac medications as prescribed. Monitor heart rate and blood pressure. Follow low-sodium diet. Avoid strenuous activities. Report any chest pain immediately.'
    },
    {
      id: '4',
      name: 'RENAL',
      nameHindi: 'गुर्दे की बीमारी',
      instructions: 'Monitor kidney function regularly. Follow renal diet. Limit protein intake. Take medications as prescribed. Stay hydrated but avoid excess fluids.'
    },
    {
      id: '5',
      name: 'RESPIRATORY',
      nameHindi: 'श्वसन रोग',
      instructions: 'Use inhalers as prescribed. Avoid smoking and pollutants. Practice breathing exercises. Get flu and pneumonia vaccines. Report breathing difficulties immediately.'
    },
    {
      id: '6',
      name: 'NEUROLOGICAL',
      nameHindi: 'न्यूरोलॉजिकल',
      instructions: 'Take neurological medications as prescribed. Monitor symptoms regularly. Follow up with neurologist. Report any changes in condition immediately.'
    },
    {
      id: '7',
      name: 'GASTROINTESTINAL',
      nameHindi: 'पाचन तंत्र',
      instructions: 'Follow gastrointestinal diet. Take medications as prescribed. Monitor symptoms. Avoid trigger foods. Report any digestive issues.'
    },
    {
      id: '8',
      name: 'DERMATOLOGICAL',
      nameHindi: 'त्वचा रोग',
      instructions: 'Apply topical medications as prescribed. Keep skin clean and moisturized. Avoid harsh chemicals. Protect from sun exposure. Report any skin changes.'
    }
  ];

  const filteredGroups = instructionGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.nameHindi.includes(searchTerm)
  );

  // Selected options for chip-like preview inside dropdown
  const selectedOptions = instructionGroups.filter(group => selectedGroupIds.includes(group.id));

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!isGroupsOpen) return;
      if (groupsRef.current && !groupsRef.current.contains(e.target as Node)) {
        setIsGroupsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [isGroupsOpen]);

  const handleGroupSelect = (group: InstructionGroup) => {
    if (selectedGroupIds.includes(group.id)) {
      setSelectedGroupIds(selectedGroupIds.filter(id => id !== group.id));
      setSelectedGroups(selectedGroups.filter(g => g.id !== group.id));
    } else {
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
      return;
    }
    
    setSelectedGroups(prev => [...prev, ...newGroups]);
    setSelectedGroupIds([]);
    setIsGroupsOpen(false);
  };

  const handleRemoveGroup = (groupId: string) => {
    setSelectedGroups(selectedGroups.filter(g => g.id !== groupId));
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid #F5F5F5'
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '600',
              color: '#333333',
              marginBottom: '4px'
            }}>
              {patientName} / {patientGender} / {patientAge} Y
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#1976D2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1565c0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1976D2';
            }}
          >
            <Close fontSize="small" />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '24px',
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
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'end' }}>
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
                  <span style={{ marginLeft: '8px', color: '#666' }}>▾</span>
                </div>

                {isGroupsOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #B7B7B7',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    marginTop: '4px'
                  }}>
                    <div style={{ padding: '6px' }}>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search instruction groups"
                        style={{
                          width: '100%',
                          height: '32px',
                          padding: '6px 8px',
                          border: '1px solid #B7B7B7',
                          borderRadius: '4px',
                          fontSize: '12px',
                          outline: 'none'
                        }}
                      />
                    </div>
                    {/* Selected groups chips (preview) */}
                    {selectedOptions.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '6px', paddingTop: 0 }}>
                        {selectedOptions.map((group) => (
                          <label key={`chip-${group.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', backgroundColor: '#e3f2fd', borderRadius: '6px', fontSize: '12px', border: '1px solid #bbdefb' }}>
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
                    <div style={{ maxHeight: '240px', overflowY: 'auto', padding: '4px 6px', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', columnGap: '8px', rowGap: '6px' }}>
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
                            style={{ margin: 0, maxWidth: 16}}
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
              <div style={{ marginTop: '20px' }}>
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

                <div style={{
                  border: '1px solid #ddd',
                  borderTop: 'none',
                  borderRadius: '0 0 4px 4px',
                  overflow: 'hidden'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{
                          padding: '12px',
                          textAlign: 'left',
                          borderBottom: '1px solid #ddd',
                          fontWeight: '600',
                          color: '#333',
                          width: '60px'
                        }}>
                          Sr.
                        </th>
                        <th style={{
                          padding: '12px',
                          textAlign: 'left',
                          borderBottom: '1px solid #ddd',
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          Group
                        </th>
                        <th style={{
                          padding: '12px',
                          textAlign: 'center',
                          borderBottom: '1px solid #ddd',
                          fontWeight: '600',
                          color: '#333',
                          width: '80px'
                        }}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedGroups.map((group, index) => (
                        <tr key={group.id}>
                          <td style={{
                            padding: '12px',
                            borderBottom: '1px solid #eee',
                            color: '#666',
                            height: '38px',
                            fontSize: '14px'
                          }}>
                            {index + 1}
                          </td>
                          <td style={{
                            padding: '12px',
                            borderBottom: '1px solid #eee',
                            color: '#666',
                            height: '38px',
                            fontSize: '14px'
                          }}>
                            {group.name}
                          </td>
                          <td style={{
                            padding: '12px',
                            borderBottom: '1px solid #eee',
                            textAlign: 'center',
                            height: '38px'
                          }}>
                            <button
                              onClick={() => handleRemoveGroup(group.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#f44336',
                                padding: '6px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#ffebee';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <Delete fontSize="small" style={{ color: 'black' }} />
                            </button>
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
              <div style={{ marginTop: '20px' }}>
                {/* <div style={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '4px 4px 0 0',
                  fontWeight: '600',
                  fontSize: '16px'
                }}>
                  Instructions
                </div> */}

                <div style={{
                  border: '1px solid #ddd',
                  borderTop: 'none',
                  borderRadius: '0 0 4px 4px',
                  overflow: 'hidden'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{
                          padding: '12px',
                          textAlign: 'left',
                          borderBottom: '1px solid #ddd',
                          fontWeight: '600',
                          color: '#333',
                          width: '60px'
                        }}>
                          Sr.
                        </th>
                        <th style={{
                          padding: '12px',
                          textAlign: 'left',
                          borderBottom: '1px solid #ddd',
                          fontWeight: '600',
                          color: '#333',
                          width: '200px'
                        }}>
                          Group
                        </th>
                        <th style={{
                          padding: '12px',
                          textAlign: 'left',
                          borderBottom: '1px solid #ddd',
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          Instructions
                        </th>
                        <th style={{
                          padding: '12px',
                          textAlign: 'center',
                          borderBottom: '1px solid #ddd',
                          fontWeight: '600',
                          color: '#333',
                          width: '80px'
                        }}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedGroups.map((group, index) => (
                        <tr key={group.id}>
                          <td style={{
                            padding: '12px',
                            borderBottom: '1px solid #eee',
                            color: '#666',
                            height: '38px',
                            fontSize: '14px'
                          }}>
                            {index + 1}
                          </td>
                          <td style={{
                            padding: '12px',
                            borderBottom: '1px solid #eee',
                            color: '#666',
                            height: '38px',
                            fontSize: '14px'
                          }}>
                            {group.name}
                          </td>
                          <td style={{
                            padding: '12px',
                            borderBottom: '1px solid #eee',
                            color: '#666',
                            height: '38px',
                            fontSize: '14px'
                          }}>
                            {group.instructions}
                          </td>
                          <td style={{
                            padding: '12px',
                            borderBottom: '1px solid #eee',
                            textAlign: 'center',
                            height: '38px'
                          }}>
                            <button
                              onClick={() => handleRemoveGroup(group.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#f44336',
                                padding: '6px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#ffebee';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <Delete fontSize="small" style={{ color: 'black' }} />
                            </button>
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
            onClick={onClose}
            style={{
              backgroundColor: '#1976D2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1565c0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1976D2';
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
