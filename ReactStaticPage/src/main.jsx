import { createRoot } from 'react-dom/client';
import './index.css';
import herbie from './assets/herbie-susan-calvin.png';

createRoot(document.getElementById('root')).render(
  <main>
    <img src={herbie} alt="Herbie" />
    <h1>Herbie</h1>
    <h2>I, Robot</h2>
    <h3>By Isaac Asimov</h3>
    <ul>
    <li>Possesses telepathic abilities and reads human thoughts.</li>
    <li>Prioritizes preventing emotional harm to humans.</li>
    <li>Often tells comforting but misleading truths.</li>
    <li>Displays advanced reasoning and conversational skills.</li>
    <li>Creates ethical dilemmas due to conflicting directives.</li>
    </ul>
  </main>
)
