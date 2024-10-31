type VolumeProps = {
  volume: number;
  handleVolumeChange: any;
}

const Volume = ({ volume, handleVolumeChange }: VolumeProps) => {
  return (
    <>
    <input 
      type="range" 
      min="0" 
      max="100" 
      value={volume} 
      onChange={handleVolumeChange} 
    />
    <p>Volume: {volume} </p>
    </>
  )
}

export default Volume;
