import React, { useEffect } from 'react'
// import React, { useEffect , useState } from 'react'



// Components
import WorkoutDetails from '../components/WorkoutDetails';
import WorkoutForm from '../components/WorkoutForm';
import { useWorkoutsContext } from '../hooks/useWorkoutsContext';
import {useAuthContext} from '../hooks/useAuthContext';



const Home = () => {

    // useState
    // const [workout, setWorkout] = useState(null);

    const {workouts, dispatch} = useWorkoutsContext();
    const {user} = useAuthContext();

    useEffect(() => {
        const fetchWorkouts = async () => {
            const response = await fetch('/api/workouts/', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const json = await response.json();

            if (response.ok) {
                // useState
                // setWorkout(json);

                dispatch({type: 'SET_WORKOUTS', payload: json});
            }
        }

        if(user){
            fetchWorkouts();
        }

        fetchWorkouts();
    }, [dispatch, user]);

    // Debug: inspect fetched workouts in console
    console.log('workouts (Home):', workouts);

  return (
    <div className='home '>
        <div className="workouts">
            {workouts && workouts.map((workout) => (
                // <p key={workout._id}>{workout.title}</p>
                <WorkoutDetails key={workout._id} workout={workout} />
            ))}
        </div>
        <WorkoutForm />
    </div>
  )
}

export default Home