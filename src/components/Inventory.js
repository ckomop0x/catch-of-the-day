import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase';
import AddFishForm from './AddFishForm';
import EditFishForm from './EditFishForm';
import Login from './Login'
import base, { firebaseApp } from "../base"

class Inventory extends PureComponent {
  static propTypes = {
    fishes: PropTypes.object,
    deleteFish: PropTypes.func,
    updateFish: PropTypes.func,
    addFish: PropTypes.func,
    loadSampleFishes: PropTypes.func,
  }

  state = {
    uid: null,
    owner: null
  }

  authHandler = async authData => {
    // 1. Look up the current store in the firebase
    const store = await base.fetch(this.props.storeId, {context: this})
    // 2. Claim if there is no owner
    if(!store.owner) {
      base.post(`${this.props.storeId}/owner`, {
        data: authData.user.uid
      })
    }
    // 3. Set the state of inventory component to reflect the current user
    this.setState({
      uid: authData.user.uid,
      owner: store.owner || authData.user.uid
    })

    await console.log(store)
    await console.log(authData)
  }

  authenticate = provider => {
    const authProvider = new firebase.auth[`${provider}AuthProvider`]()
    firebaseApp
      .auth()
      .signInWithPopup(authProvider)
      .then(this.authHandler)
  }

  logout = async () => {
    await firebase.auth().signOut()
    this.setState({uid: null})
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if(user) {
        this.authHandler({user})
      }
    })
  }

  render() {
    const {fishes} = this.props;

    const logout = <button onClick={this.logout}>Log Out!</button>

    // 1. Check if logged
    if (!this.state.uid) {
      return <Login authenticate={this.authenticate}/>
    }

    if (this.state.uid !== this.state.owner) {
      return (
        <div>
          <p>You are not he owner!</p>
          {logout}
        </div>
      )
    }

    return (
      <div className="inventory">
        <h2>Inventory</h2>
        {logout}
        {Object.keys(fishes).map(key => (
          <EditFishForm key={key}
                        index={key}
                        fish={fishes[key]}
                        deleteFish={this.props.deleteFish}
                        updateFish={this.props.updateFish}/>
        ))}
        <AddFishForm addFish={this.props.addFish}/>
        <button onClick={this.props.loadSampleFishes}>Load Sample Fishes</button>
      </div>
    )
  }
}

export default Inventory
