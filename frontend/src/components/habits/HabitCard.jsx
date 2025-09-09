import { CheckCircle, Circle, Flame, Calendar } from 'lucide-react';

import { useState } from 'react';
import CreateHabitModal from './CreateHabitModal';
import { habitsAPI, checkInsAPI } from '../../services/api.js';
import toast from 'react-hot-toast';

const HabitCard = ({ habit, onCheckIn ,setHabits}) => {
    
const [showCreateModal,setShowCreateModal]=useState(false)
    const handleCreateHabit = async (habit) => {

        try {
          await habitsAPI.createHabit(habit);
          toast.success('Habit created successfully!');
          setShowCreateModal(false);
          fetchHabits();
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to create habit';
          toast.error(message);
        }
      };
  const getCategoryColor = (category) => {
    const colors = {
      health: 'bg-red-100 text-red-800',
      fitness: 'bg-blue-100 text-blue-800',
      learning: 'bg-green-100 text-green-800',
      productivity: 'bg-yellow-100 text-yellow-800',
      mindfulness: 'bg-purple-100 text-purple-800',
      social: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
  };

  const getFrequencyIcon = (frequency) => {
    return frequency === 'daily' ? Calendar : Calendar;
  };

  const handleEdit=()=>{
    setShowCreateModal(true)
  }


  const handleDelete=async()=>{
   const res= await habitsAPI.deleteHabit(habit._id);
   console.log(res);
   if(res.status==200)
   { toast.success('Habit Deleted')
    setHabits((prev)=>(prev.filter((p)=>p._id!=habit._id)))
   }
  }

  const FrequencyIcon = getFrequencyIcon(habit.frequency);


  

  return (
    <div className=" rounded-3xl shadow-sm border  bg-white/80    border-gray-300 p-6 hover:shadow-md duration-300 ease-in transition-all">
      <div className="flex  justify-around mb-4  flex-row-reverse ">
      {!habit.checkedInToday&&!habit.checkedInToday&&<button
       className='bg-green-600 text-white px-4 max-h-10 py-2 rounded-lg hover:bg-indigo-700 transition-colors' onClick={handleEdit} >
        Edit
        </button>}
        {!habit.checkedInToday&&<button
         className='bg-red-600 text-white px-4 max-h-10 py-1 mr-2 rounded-lg hover:bg-indigo-700 transition-colors' onClick={handleDelete} 
        >
          Delete
          </button>}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {habit.name}
          </h3>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(habit.category)}`}>
              {habit.category}
            </span>
            <div className="flex items-center text-xs text-gray-500">
              <FrequencyIcon className="h-3 w-3 mr-1" />
              {habit.frequency}
            </div>
          </div>

    
          {habit.description && (
            <p className="text-sm text-gray-600 mb-3">{habit.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-900">
              {habit.streak || 0} day streak
            </span>
          </div>
        </div>

        <button
          onClick={onCheckIn}
          disabled={habit.checkedInToday}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            habit.checkedInToday
              ? 'bg-green-100 text-green-800 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {habit.checkedInToday ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <span>Done</span>
            </>
          ) : (
            <>
              <Circle className="h-4 w-4" />
              <span>Check In</span>
            </>
          )}
        </button>
      </div>

    <div className='absolute left-[50%] top-[50%]'>
           {/* Create Habit Modal */}
           {showCreateModal && (
        <CreateHabitModal
          data={habit}
          setHabits={setHabits}
          setShowCreateModal={setShowCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateHabit}
        />
      )}
    </div>
    </div>
  );
};

export default HabitCard;
