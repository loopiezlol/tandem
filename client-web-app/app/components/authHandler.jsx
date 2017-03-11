import { hashHistory } from 'react-router';
import Reflux from 'reflux';
// import React from 'react';
import Auth from '../stores/auth';

class AuthHandler extends Reflux.Component {
  constructor(props) {
    super(props);
    this.store = Auth;
  }

  render() {
    return this.props.children;
  }


  componentDidMount() {
    if (this.state.status === 'in') {
      hashHistory.push('/message');
    } else {
      hashHistory.push('/login');
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.status !== this.state.status ||
      this.props.children === null) {
      if (this.state.status === 'in') {
        hashHistory.push('/message');
      } else {
        hashHistory.push('/login');
      }
    }
  }
}

export default AuthHandler;
