import { hashHistory } from 'react-router';
import Loading from 'react-loading';
import Reflux from 'reflux';
import React from 'react';
import Auth from '../stores/auth';
import sbactions from '../actions/sbActions';
import sbStore from '../stores/sbStore';


/* authhandeler main component
*/
class AuthHandler extends Reflux.Component {
  constructor(props) {
    super(props);
    this.stores = [Auth, sbStore];
  }

  render() {
    return this.state.me ? this.props.children : <Loading type="cyclon" />;
  }

  componentDidMount() {
    const { status } = this.state;
    if (status === 'in' && this.props.children === null) {
      sbactions.loginUser(this.state.me.email);
      // could be improved with indexroute I guess
      // Currently set the main page as /message because we didn't have another one
      hashHistory.push('/');
    } else if (status === 'off') {
      hashHistory.push('/login');
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { status, me } = this.state;
    if (prevState.status !== status ||
      this.props.children === null ||
      me.onboardingDone !== prevState.me.onboardingDone ||
      (prevProps.location.pathname !== this.props.location.pathname && this.props.location.pathname === '/onboarding')) {
      if (status === 'in') {
        sbactions.loginUser(this.state.me.email);
        if (me.onboardingDone) {
          hashHistory.push('/home');
        } else {
          hashHistory.push('/onboarding');
        }
      } else {
        hashHistory.push('/login');
      }
    }
  }
}

export default AuthHandler;
