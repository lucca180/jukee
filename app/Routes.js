import React from 'react';
import { Switch, Route } from 'react-router-dom';
import App from './containers/App';
import HomePage from './containers/HomePage';
import KaraokeRoom from './containers/KaraokeRoom';
import ScorePage from './containers/ScorePage';

export default () => (
  <App>
    <Switch>
      <Route path="/score" exact component={ScorePage} />
      <Route path="/room" exact component={KaraokeRoom} />
      <Route path="/" exact component={HomePage} />
    </Switch>
  </App>
);
