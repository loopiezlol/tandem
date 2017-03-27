import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import React from 'react';
import Discover from './discover';
import Messaging from './messaging/messaging';
import '../styles/appStyles.scss';

const MainComponent = (props) => {
  switch (props.opened) {
    case 'messaging':
      return <Messaging userToRender={props.userToRender} />;
    case 'profile':
      return <div>profile  :)</div>;
    case 'discover':
    default:
      return <Discover onMessage={props.redirect} />;
  }
};

class PaneControl extends React.Component { // !! not reflux
  constructor(props) {
    super(props);
    this.state = {
      openedTab: 'discover',
      navigatiorOpen: window.innerWidth > 500,
      userToRender: {},
    };
  }

  switchTo(openedTab) {
    this.setState({
      openedTab,
      navigatiorOpen: false,
    });
  }

  handleToggleNavigator(navigatiorOpen) {
    this.setState({
      navigatiorOpen: !navigatiorOpen,
    });
  }

  handleRedirect(tabToOpen, optionalUser) {
    this.setState({
      openedTab: tabToOpen,
      userToRender: optionalUser,
    });
  }

  render() {
    const { openedTab, navigatiorOpen, userToRender } = this.state;
    return (
      <MuiThemeProvider>
        <div className={`main-wrapper nav-${navigatiorOpen ? 'visible' : 'hidden'}`}>
          <div className="control-tabs">
            <div onTouchTap={() => this.switchTo('discover')} className="wrapper-control-button">
              <p>Discover</p>
            </div>
            <div onTouchTap={() => this.switchTo('messaging')} className="wrapper-control-button">
              <p>Messaging</p>
            </div>
            <div onTouchTap={() => this.switchTo('profile')} className="wrapper-control-button">
              <p>Profile</p>
            </div>
          </div>
          <div className="opened-wrapper" >
            <div
              className="navigator-toggler"
              onTouchTap={() => this.handleToggleNavigator(navigatiorOpen)}
            >
              <img className={`navigator-toggler-icon ${navigatiorOpen ? 'expanded' : ''}`} src={require('../../public/ic_chevron_right_black_24px.svg')} />
            </div>
            <MainComponent opened={openedTab} redirect={(tabToOpen, optionalUser) => this.handleRedirect(tabToOpen, optionalUser)} userToRender={userToRender} />
          </div>
        </div>
      </MuiThemeProvider>
    );
  }

}

export default PaneControl;
