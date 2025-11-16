import { clientEnv } from "~/env/client"

export const Schedules = () => {



  const testClick = () => {
    fetch(clientEnv.VITE_OCELOT_URL + '/museum/capacity/test', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        room: 'salle1',
        message: new Date().toISOString()
      })
    })
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.error(err)
      })
  }
  return (
    <div>
      ici les horaires



      <button onClick={testClick}>Test</button>
    </div>
  )
}