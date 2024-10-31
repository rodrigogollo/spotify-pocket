import { msToTime } from "../../utils/utils";

type SeekProps = {
  seek: number;
  max: number;
  handleSeek: any;
}

const Seek = ({ max, handleSeek, seek }: SeekProps) => {
  return (
    <>
      <input 
        type="range" 
        min="0" 
        max={max} 
        onChange={handleSeek} 
        value={seek}
      />
      <p>Max: {msToTime(max)} Time: {msToTime(seek)} </p>
    </>
  )
}

export default Seek;
