import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import CheckBox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import ChipInput from 'material-ui-chip-input';
import IconButton from 'material-ui/IconButton';
import React from 'react';
import Reflux from 'reflux';
import Auth from '../stores/auth';

import iconsWithLabels from '../interests';

/* The filtering subsection
which let users to filter interests,languages and see the users according to that
*/
class Filters extends Reflux.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      genderBoxContent: false,
      languageBoxContent: false,
      chips: [],
      interests: Array(iconsWithLabels.length).fill(false),
    };
    this.stores = [Auth];
  }

  render() {
    const { onSearch: search, visible } = this.props;
    const { searchText, genderBoxContent, languageBoxContent, chips, interests, me } = this.state;

    const queryParameters = {
      name: searchText,
      sameGender: genderBoxContent,
      matchLanguages: languageBoxContent,
      languagesToMatch: chips.map(chip => chip._id),
      interests: iconsWithLabels.reduce(
        (acc, val, index) => (interests[index] ? [...acc, val.label] : acc),
         [],
       ),
    };

    return (
      <div className={`control-discover-filter ${visible ? 'visible' : 'hidden'}`}>
        <TextField
          hintText="Search by name, username or email:"
          onChange={e => this.handleType(e)}
        />
        <Divider />
        <CheckBox
          label="Match with people of the same gender"
          onCheck={(e, checked) => this.handleGenderBox(checked)}
        />
        <CheckBox
          label="Only show people that want to learn my language"
          onCheck={(e, checked) => this.handleLanguageBox(checked)}
        />
        <ChipInput
          floatingLabelText="Limit results to users that speak"
          openOnFocus
          fullWidth
          hintText="Leave empty to ignore languages"
          value={this.state.chips}
          dataSource={me.wantsToLearn}
          dataSourceConfig={{ text: 'name', value: '_id' }}
          onRequestAdd={chip => this.handleAddChip(chip)}
          onRequestDelete={(chip, index) => this.handleDeleteChip(chip, index)}
        />
        <div className="filters-interests">
          Choose interests:<br />
          {iconsWithLabels.map((interest, index) => (
            <IconButton
              key={`interest-${interest.label}`}
              tooltip={interest.label}
              onTouchTap={() => this.handleInterest(index)}
            >
              <img className={`interest-icon ${this.state.interests[index] ? 'selected' : ''}`} src={require(`../../public/png/${interest.icon}.png`)} />
            </IconButton>
          ))}
        </div>
        <FlatButton
          fullWidth
          label="Search"
          primary
          onTouchTap={() => search(queryParameters, this.state.me._id)}
        />
      </div>
    );
  }

// Handleres for each filter selecting
  handleInterest(index) {
    const { interests } = this.state;
    interests[index] = !interests[index];
    this.setState({
      interests,
    });
  }

  handleAddChip(chip) {
    const foundLanguage = this.state.me.wantsToLearn.find(language => language.name.match(new RegExp(`^${chip.name}`, 'i')));
    if (!foundLanguage) {
      alert('No such language!');
      return;
    }
    if (this.state.chips.includes(foundLanguage)) {
      return;
    }

    this.setState({
      chips: [...this.state.chips, foundLanguage],
    });
  }

  handleDeleteChip(chip, index) {
    const chips = this.state.chips;
    chips.splice(index, 1);
    this.setState({
      chips,
    });
  }

  handleType(e) {
    this.setState({
      searchText: e.target.value,
    });
  }

  handleGenderBox(checked) {
    this.setState({
      genderBoxContent: checked,
    });
  }

  handleLanguageBox(checked) {
    this.setState({
      languageBoxContent: checked,
    });
  }
}

export default Filters;
