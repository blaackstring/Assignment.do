import { useState } from 'react';
import { X, Target } from 'lucide-react';
import { habitsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CreateHabitModal = ({ onClose, onSubmit ,data,setShowCreateModal,setHabits}) => {
  const [formData, setFormData] = useState(data!=null ? data:{
    name: '',
    category: 'other',
    frequency: 'daily',
    description: '',
    reminder:''
  });

  const categories = [
    { value: 'health', label: 'Health' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'learning', label: 'Learning' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'social', label: 'Social' },
    { value: 'other', label: 'Other' },
  ];


  const handleUpdate=async()=>{
    try {
      const res =await habitsAPI.updateHabit(formData._id,formData)
      if(res.status==200){
      toast.success(res.data.message)
      setHabits((prev)=>([...prev,res.data]))
      setShowCreateModal(false)
    }
      
    } catch (error) {
      toast.error( 'Error While Updating')
    }
    
    
   
  }
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if(setHabits) return
    if (!formData.name.trim()) return;
    
    onSubmit({
      name: formData.name.trim(),
      category: formData.category,
      frequency: formData.frequency,
      description: formData.description.trim(),
      reminder:formData.reminder
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white/80 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
          {  data!=null?<h2 className="text-xl font-semibold text-gray-900">Update Habit</h2>:<h2 className="text-xl font-semibold text-gray-900">Create New Habit</h2>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Habit Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
             
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Drink 8 glasses of water"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              id="frequency"
              name="frequency"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.frequency}
              onChange={handleChange}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Add a description for your habit..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="reminder" className="block text-sm font-medium text-gray-700 mb-1">
             Reminder (Optional)
            </label>
            <input
              id="reminder"
              type='time'
              name="reminder"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Add Reminder to Notiify your habit..."
              value={formData.remainder}
              onChange={handleChange}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
           { data==null?<button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Habit
            </button>:
            <button
            type='button'
            onClick={handleUpdate}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Update Habit
            </button>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHabitModal;
