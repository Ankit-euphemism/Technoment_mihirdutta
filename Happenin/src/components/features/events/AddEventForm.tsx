
import React, { useState } from 'react';
import { createEvent } from '../../../services/eventServices';
import type { CreateEventInput } from '../../../types';

interface AddEventFormProps {
  onCreated?: (eventId: string) => void;
}

const getErrorMessage = (err: unknown): string => {
  const rlsHint = 'new row violates row-level security policy';

  if (err instanceof Error && err.message) {
    if (err.message.toLowerCase().includes(rlsHint)) {
      return 'You are not allowed to create events yet. Sign in with an authenticated account and add the required Supabase RLS policy for events insert.';
    }
    return err.message;
  }

  if (typeof err === 'object' && err !== null && 'message' in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim().length > 0) {
      if (message.toLowerCase().includes(rlsHint)) {
        return 'You are not allowed to create events yet. Sign in with an authenticated account and add the required Supabase RLS policy for events insert.';
      }
      return message;
    }
  }

  return 'Failed to create event';
};

const AddEventForm: React.FC<AddEventFormProps> = ({ onCreated }) => {
  const [formData, setFormData] = useState<CreateEventInput>({
    title: '',
    description: null,
    location: '',
    latitude: 26.8393,
    longitude: 80.9231,
    max_capacity: 100,
    image_url: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const createdEvent = await createEvent(formData);

      setMessage('Event created successfully.');
      setFormData({
        title: '',
        description: null,
        location: '',
        latitude: 26.8393,
        longitude: 80.9231,
        max_capacity: 100,
        image_url: null,
      });
      onCreated?.(createdEvent.id);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-gray-900 rounded-xl border border-gray-700">
      <input
        className="w-full p-2 bg-gray-800 text-white rounded"
        placeholder="Event Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <input
        className="w-full p-2 bg-gray-800 text-white rounded"
        placeholder="Location"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        required
      />

      <textarea
        className="w-full p-2 bg-gray-800 text-white rounded min-h-24"
        placeholder="Description (optional)"
        value={formData.description ?? ''}
        onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <label className="flex flex-col gap-1 text-sm text-gray-300">
          Latitude
          <input
            type="number"
            step="0.0001"
            className="w-full p-2 bg-gray-800 text-white rounded"
            placeholder="Latitude"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-300">
          Longitude
          <input
            type="number"
            step="0.0001"
            className="w-full p-2 bg-gray-800 text-white rounded"
            placeholder="Longitude"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-300">
          Capacity
          <input
            type="number"
            min={1}
            className="w-full p-2 bg-gray-800 text-white rounded"
            placeholder="Capacity"
            value={formData.max_capacity}
            onChange={(e) => setFormData({ ...formData, max_capacity: Number(e.target.value) })}
            required
          />
        </label>
      </div>

      <input
        className="w-full p-2 bg-gray-800 text-white rounded"
        placeholder="Image URL (optional)"
        value={formData.image_url ?? ''}
        onChange={(e) => setFormData({ ...formData, image_url: e.target.value || null })}
      />

      {message && <p className="text-green-300 text-sm">{message}</p>}
      {error && <p className="text-red-300 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 py-2 rounded font-bold text-white hover:bg-blue-500 transition-colors disabled:opacity-60"
      >
        {isSubmitting ? 'Creating...' : 'Post Event'}
      </button>
    </form>
  );
};

export default AddEventForm;