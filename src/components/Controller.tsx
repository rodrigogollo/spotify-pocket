const Controller = () => {
  const handlePreviousSong = () => {
    console.log("previous");
  }

  const handleNextSong = () => {
    console.log("next");
  }

  const handleToggle = () => {
    console.log("toggle");
  }

  return <>
    <span onClick={handlePreviousSong}>Prev</span>
    <span onClick={handleToggle}>Play/Pause</span>
    <span onClick={handleNextSong}>Next</span>
  </>
}

export default Controller; 
