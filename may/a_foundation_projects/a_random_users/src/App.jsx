import { useState , useEffect} from 'react'

import './App.css'
import UserCard from './components/UserCard';

function App() {
  const [user, setUser] = useState(null)
  const [randomUser, setRandomUser] = useState(0)

  useEffect(() => {

    fetch('https://api.freeapi.app/api/v1/public/randomusers/user/random')
      .then(response => response.json())
      .then(data => {
        setUser(data.data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, [randomUser])


  console.log(user)
  return (
   <>
  <div className="app-shell">
      <h1>Random Users</h1>
     <UserCard
  image={user?.picture?.medium}
  name={user ? `${user?.name?.first} ${user?.name?.last}` : 'Loading user'}
  location={user ? `${user?.location?.city}, ${user?.location?.country}` : 'Fetching profile'}
/>
<button onClick={() => {
  setRandomUser(prev => prev + 1);
}}>Get New User</button>


   </div>
   </>
  )
}

export default App
