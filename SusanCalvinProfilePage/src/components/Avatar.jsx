import SusanCalvin from "./../assets/herbie-susan-calvin.png";

export default function Avatar () {
  const alt = "Susan Calvin having a conversation with Herbie";
  return (
    <div className="avatar">
      <img src={SusanCalvin} alt={alt}/>
    </div>
  );
}
