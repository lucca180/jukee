// @flow
import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import type { Store } from '../reducers/types';
import Routes from '../Routes';
import JukeeTitleBar from '../components/TitleBar';

import { StylesProvider, createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

type Props = {
  store: Store,
  history: {}
};


const theme = createMuiTheme({
      palette: {
        type: 'dark',
        primary: {
          main: "#A45FA1",
        }
      },
    });


const Root = ({ store, history }: Props) => (
  <Provider store={store}>
    <JukeeTitleBar/>
    <ConnectedRouter history={history}>
      <StylesProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Routes />
        </ThemeProvider>
      </StylesProvider>
    </ConnectedRouter>
  </Provider>
);

export default hot(Root);
