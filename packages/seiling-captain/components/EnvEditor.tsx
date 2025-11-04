'use client';

import { useState, useEffect } from 'react';
import type { EnvSchema } from '../lib/env';

interface EnvEditorProps {
  initialVars?: Record<string, string>;
  schema?: EnvSchema;
}

export default function EnvEditor({ initialVars = {}, schema = {} }: EnvEditorProps) {
  const [vars, setVars] = useState<Record<string, string>>(initialVars);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    setVars(initialVars);
  }, [initialVars]);

  const handleVarChange = (key: string, value: string) => {
    setVars(prev => ({
      ...prev,
      [key]: value,
    }));
    setError(null);
    setValidationErrors([]);
  };

  const validate = (): boolean => {
    const errors: string[] = [];

    for (const [key, value] of Object.entries(vars)) {
      const schemaEntry = schema[key];
      if (schemaEntry) {
        if (schemaEntry.required && !value) {
          errors.push(`${key} is required`);
        }
        if (schemaEntry.type === 'number' && value && isNaN(Number(value))) {
          errors.push(`${key} must be a number`);
        }
        if (schemaEntry.type === 'url' && value) {
          try {
            new URL(value);
          } catch {
            errors.push(`${key} must be a valid URL`);
          }
        }
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    
    if (!validate()) {
      setError('Validation failed. Please fix the errors below.');
      return;
    }

    setSaving(true);
    
    try {
      const response = await fetch('/api/env', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vars }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save environment variables');
      }

      setSuccess(data.message || 'Environment variables saved successfully');
      if (data.backup) {
        console.log('Backup created:', data.backup);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Group variables by section
  const groupedVars: Record<string, string[]> = {};
  for (const key of Object.keys(vars)) {
    const schemaEntry = schema[key];
    const section = schemaEntry?.section || 'Other';
    if (!groupedVars[section]) {
      groupedVars[section] = [];
    }
    groupedVars[section].push(key);
  }

  return (
    <div>
      <div className="section">
        <h2 className="heading" style={{ fontSize: 24, marginBottom: 8 }}>Environment Editor</h2>
        <p className="muted">Edit environment variables for your Seiling Buidlbox v2 deployment.</p>
      </div>

      {error && (<div className="card" style={{ borderColor: '#fecaca', background: '#fee2e2', color: '#991b1b' }}>{error}</div>)}

      {success && (<div className="card" style={{ borderColor: '#86efac', background: '#d1fae5', color: '#065f46' }}>{success}</div>)}

      {validationErrors.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          {validationErrors.map((err, idx) => (
            <div key={idx} style={{ color: '#ef4444', fontSize: '14px', marginBottom: '4px' }}>
              {err}
            </div>
          ))}
        </div>
      )}

      {Object.entries(groupedVars).map(([section, keys]) => (
        <div key={section} className="section">
          <h3 className="heading" style={{ fontSize: 18 }}>{section}</h3>
          <div className="card" style={{ padding: 0 }}>
            {keys.map(key => {
              const schemaEntry = schema[key];
              const type = schemaEntry?.type || 'string';
              
              return (
                <div 
                  key={key} 
                  style={{ padding: 16, borderBottom: '1px solid var(--sbx-gray-light)', backgroundColor: 'var(--bg-surface)' }}
                >
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{key}</div>
                    {schemaEntry?.description && (
                      <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
                        {schemaEntry.description}
                      </div>
                    )}
                    {schemaEntry?.required && (
                      <span style={{ fontSize: 12, color: '#ef4444', marginLeft: 8 }}>
                        (required)
                      </span>
                    )}
                  </label>
                  {type === 'boolean' ? (
                    <select
                      value={vars[key] || 'no'}
                      onChange={(e) => handleVarChange(key, e.target.value)}
                      className="select"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  ) : (
                    <input
                      type={
                        type === 'number'
                          ? 'number'
                          : type === 'url'
                          ? 'url'
                          : key.toLowerCase().includes('password') || key.toLowerCase().includes('key')
                          ? 'password'
                          : 'text'
                      }
                      value={vars[key] || ''}
                      onChange={(e) => handleVarChange(key, e.target.value)}
                      placeholder={schemaEntry?.default || ''}
                      className="input"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

