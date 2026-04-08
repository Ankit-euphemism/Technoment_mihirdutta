
import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Event } from '../../../types';

// Pick only the fields we need for creation
type CreateEventInput = Omit<Event, 'id' | 'created_at'>;

const AddEventForm: React.FC = () => {
  const [formData, setFormData] = useState<CreateEventInput>({
    title: '',
    description: '',
    location: '',
    latitude: 26.8393,
    longitude:  80.9231,
    max_capacity: 100,
    image_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('events')
      .insert([formData]);

    if (error) {
      console.error("Error:", error.message);
    } else {
      alert("Event is now Live! Check the map. 🚀");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-gray-900 rounded-xl border border-gray-700">
      <input 
        className="w-full p-2 bg-gray-800 text-white rounded"
        placeholder="Event Title"
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        required
      />
      <button type="submit" className="w-full bg-blue-600 py-2 rounded font-bold text-white hover:bg-blue-500 transition-colors">
        Post Event
      </button>
    </form>
  );
};

export default AddEventForm;