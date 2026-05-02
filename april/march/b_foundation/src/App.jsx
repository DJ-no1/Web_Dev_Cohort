

function Shell({title, children}) {
  return (
    <section>
      <h1>{title}</h1>
      {children}
    </section>
  )
}



function App() {

  return (
   <>
    <Shell title="hello from anand">
      <p>this is the content of the shell</p>
    </Shell>
   </>
  )
}

export default App
