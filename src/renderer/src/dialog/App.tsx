function App(): JSX.Element {
  const { searchParams } = new URL(window.location.href)
  const afterFail = searchParams.get('afterFail')
  const handleSetupDatabase = async (): Promise<void> => {
    await window.api.setupDatabase().catch((error) => {
      alert(error?.message)
    })
  }

  return (
    <div className="container">
      <div onClick={handleSetupDatabase}>Setup database</div>
      {afterFail && (
        <div style={{ opacity: 0.5, fontSize: 12, textAlign: 'center', color: '#fd0000' }}>
          Something went wrong while connecting to the database, please select the correct location
          of the database
        </div>
      )}
    </div>
  )
}

export default App
