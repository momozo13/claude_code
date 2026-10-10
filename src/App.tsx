import { useCurrentGame } from './store';
import Home from './components/Home';
import GameView from './components/GameView';

export default function App() {
  const game = useCurrentGame();
  return game ? <GameView game={game} /> : <Home />;
}
