import React, { Component } from 'react'
import { withRouter } from 'react-router'

class NoteConnections extends Component{
  constructor(props){
    super(props)
    this.distance = this.distance.bind(this)
    this.midPoint = this.midPoint.bind(this)
    this.slope = this.slope.bind(this)
  }

  distance = (div1, div2) => {
    let distance = 0
    return distance = Math.sqrt(((div1.position[0] - div2.position[0]) * (div1.position[0] - div2.position[0]))
     + ((div1.position[1] - div2.position[1]) * (div1.position[1] - div2.position[1])))
  }

  midPoint = (div1, div2) => {
    let xMid = (div1.position[0] + div2.position[0]) / 2
    let yMid = (div1.position[1] + div2.position[1]) / 2

    return
  }

  slope = (div1, div2) => {
    let slopeRadian = Math.atan(div1.position[1] - div2.position[1], div1.position[0] - div2.position[0])
    let slopeDegrees = (slopeRadian * 180) / Math.PI
  }

  render(){
    return (
      <div>
      Testing NoteConnections
      </div>
    )
  }
}

const mapState = ({notes}) =({notes})

const mapDispatch = null

export default withRouter(connect(mapState, mapDispatch)(NoteConnections))
