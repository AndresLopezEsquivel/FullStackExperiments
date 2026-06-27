import './App.css'
import Avatar from "./components/Avatar.jsx";
import FollowButton from './components/FollowButton.jsx';
import ProfileInfo from "./components/ProfileInfo.jsx"
import SocialLinks from "./components/SocialLinks.jsx";
import StatsRow from './components/StatsRow.jsx';

function App() {
  return (
    <div className="profile-card">
      <Avatar />
      <ProfileInfo />
      <StatsRow />
      <SocialLinks />
      <FollowButton />
    </div>
  )
}

export default App
