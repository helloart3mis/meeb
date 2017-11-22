import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import Chatbox from './Chatbox'
import Attendees from './Attendees'

export class Sidebar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      show: true
    }
  }

  render() {
    const { show } = this.state
    return (
      <div className="sidebar">
        <button onClick={() => this.setState({ show: !show })}>-</button>
          {
            show ?
            <div>
              <h5 href="#">
              <div>Attendees</div>
              <i alt="Brand" className="glyphicon glyphicon-comment">
              </i>
            </h5>
            <Attendees />
            <Chatbox />
            </div> : null
          }
      </div>
    );
  }
}

const mapState = null

const mapDispatch = null

export default withRouter(connect(mapState, mapDispatch)(Sidebar))
