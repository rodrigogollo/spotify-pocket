import { msToTime } from "../../utils/utils";

type SeekProps = {
  seek: number;
  max: number;
  handleSeek: any;
}

const Seek = ({ max, handleSeek, seek }: SeekProps) => {
  return (
    <>
      <p>({msToTime(seek)}/{msToTime(max)})</p>
      <input 
        type="range" 
        min="0" 
        max={max} 
        onChange={handleSeek} 
        value={seek}
      />
      <p>{msToTime(max)}</p>
    </>
  )
}

export default Seek;
