/* eslint-disable no-lone-blocks */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { editNote, fetchNotes, deleteNote } from '../store'
import { withRouter } from 'react-router'

class Whiteboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dragging: false,
      rel: null,
      pos: {x: null, y: null},
      selectedNote: 0,
      connectionArray: [],
      edges: [],
      nodes: [],
      parentChildPos: {},
      line: {x: null, y: null},
      target: [],
    }
    this.clickImage = this.clickImage.bind(this)
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.clickConnection = this.clickConnection.bind(this)
    this.updateParent = this.updateParent.bind(this)
    this.submitEdges = this.submitEdges.bind(this)
  }


  componentDidMount() {
    this.props.fetchNotes(this.props.match.params.id)
  }

  componentDidUpdate(props, state) {
    if (this.state.dragging && !state.dragging) {
      document.addEventListener('mousemove', this.onMouseMove)
      document.addEventListener('mouseup', this.onMouseUp)
    } else if (!this.state.dragging && state.dragging) {
      document.removeEventListener('mousemove', this.onMouseMove)
      document.removeEventListener('mouseup', this.onMouseUp)
    }
    if (state.parentChildPos.length !== this.state.parentChildPos.length ||
      this.state.dragging && !state.dragging) {

    }
  }

  clickImage (evt) {
    evt.preventDefault();
  }

  //when user clicks mouse down, dragging state is set to true and new relative position
  //is calculated, the position is set to null
  onMouseDown(evt) {
    if (evt.button !== 0) return

    var pos = evt.target.getBoundingClientRect()
    this.setState({
      dragging: true,
      rel: {
        x: evt.pageX - pos.left,
        y: evt.pageY - pos.top
      },
      pos: {
        x: null,
        y: null
      },
      target: [
        evt.pageX - pos.left,
        evt.pageY - pos.top
      ],
      line: {
        x: null,
        y: null
      }
    })
    const parentChildPos = this.state.parentChildPos
    if (this.state.parentChildPos.length){
      parentChildPos[0].target = this.state.target
      this.setState({
        parentChildPos
      })
    }
    console.log('target', this.state.target)
    evt.stopPropagation()
    evt.preventDefault()
  }

  //once mouse is released, the new position of note is updated in db
  //and dragging is set to false
  onMouseUp(evt) {
    if (this.state.pos.x !== null && this.state.pos.y !== null) this.props.editNote(this.state.selectedNote, {position: [this.state.pos.x, this.state.pos.y]})
    evt.stopPropagation()
    evt.preventDefault()
    console.log('onMouseUp', this.state.parentChildPos)
    this.setState({dragging: false})
  }

  //when state.pos is set to anything but null, the top and left of card is set to state.pos instead of note.position[0] & note.position[1]
  onMouseMove(evt) {
    if (!this.state.dragging) return
    this.setState({
      pos: {
        x: evt.pageX - this.state.rel.x,
        y: evt.pageY - this.state.rel.y
      },
      line: {
        x: evt.pageX - this.state.rel.x,
        y: evt.pageY - this.state.rel.y
      }
    })
    evt.stopPropagation()
    evt.preventDefault()
  }

  handleDelete(evt) {
    evt.preventDefault();
    this.props.deleteNote(evt.target.value, this.props.boardId);
  }

  clickConnection = (evt, note) => {
    if (this.state.connectionArray.indexOf(note.id) === -1 && note.id !== 0) {
      this.setState({connectionArray: [...this.state.connectionArray, note.id]})
      this.setState({nodes: [...this.state.nodes, note]})
      // let selectedCard = document.getElementById(`card${id}`)
      // selectedCard.className = 'DropShadow'
    } else if (note.id !== 0) {
      let array = this.state.connectionArray
      let index = array.indexOf(note.id)
      array.splice(index, 1)
      this.setState({ connectionArray: array})
      // let selectedCard = document.getElementById(`card${id}`)
      // selectedCard.className = 'card'
    }
  }
  submitEdges = () => {
    let edgeTracker = []
    let parent = Number(this.state.connectionArray.slice(0, 1))
    let parentPos = this.state.nodes.slice(0, 1)
    let parentChildPos = []
    this.state.connectionArray.slice(1).forEach(connection => {
        edgeTracker.push({source: parent, target: connection })
    })

    this.state.nodes.slice(1).forEach(position => {
      parentChildPos.push({id: position.id, source: parentPos, target: position.position})
    })
    this.setState({edges: edgeTracker})
    this.setState({parentChildPos: parentChildPos})
    // console.log('nodes', this.state.nodes)
    // console.log('parentPos', parentChildPos)
    // console.log('line', this.state.line)
  }

  updateParent = () => {
    let noteParent = {
      NoteParent: {
        noteParentId: 0
      }
    }
    if (this.state.connectionArray.length > 1) {
      for (var i = 1; i < this.state.connectionArray.length; i++){
        this.props.editNote(this.state.connectionArray[i], {noteParent: { NoteParent: { noteParentId: this.state.connectionArray[0]}}})
      }
    }
  }

  render() {
    // console.log('nodes', this.state.nodes)
    // console.log('connectionArray', this.state.connectionArray)
    // console.log('whiteboard', this.props)
    // console.log('edges', this.state.edges)
    let data = [];
    if (this.props.notes) {
      data = this.props.notes
    }
    return (
      <div id="whiteboard">
       <svg id="basket" width="300" height="250">
      <g>
        <rect
           width="300" height="250"
        style = {{fill: 'white', stroke: 'black', strokeWidth: 5, opacity: 0.5}} />
        <text x="4" y="50" fontFamily="Verdana" fontSize="35" fill="blue">Idea Basket</text>
      </g>
      </svg>
      {
        data && data.map((note) => {
          {
            return note.position &&
             (
                  <div
                    id={`card${note.id}`}
                    className="card"
                    key={note.id}
                    style = {{position: 'absolute', left: this.state.selectedNote === note.id && this.state.pos.x || note.position[0], top: this.state.selectedNote === note.id && this.state.pos.y || note.position[1], cursor: 'pointer' }}
                    onMouseMove={this.onMouseMove}
                    onMouseUp={this.onMouseUp}
                    onClick={(evt) => this.clickConnection(evt, note)}
                    onMouseDown={(evt) => {this.setState({ selectedNote: note.id }); this.onMouseDown(evt);}} >

                  <button value={note.id} onClick={this.handleDelete}>x</button>
                    { note.text &&
                      <div className="card-content">
                        {note.text}
                      </div>
                    }


                    {note.image &&
                      <div className="card-image">
                        <img onClick={this.clickImage} src={note.image} />
                      </div>
                    }


                    {note.link &&
                      <div className="card-action">
                        <a type="text/css" href={note.link}>Go Here </a>
                      </div>
                    }
                  </div>

                )
            }

          })
        }
        <div id="branch-panel" className="fixed-action-btn vertical click-to-toggle" onClick={() => {this.submitEdges()}}>
          <a className="btn-floating btn-large blue">
            <img src="/icons8-connect-40.png" align="center" alt="Branch" />
          </a>
          <ul>
            <li><a className="btn-floating light white" onClick={() => {this.updateParent()}}><img src="/icons8-checkmark-30.png" align="center" alt="Parent" /></a></li>
          </ul>
        </div>
        <svg width="500" height="500">
          {
            this.state.parentChildPos.length
            ? this.state.parentChildPos.map(position => {
              return (
                  <line  key={position.id + position.source[0].id.toString()} x1={position.source[0].position[0]} y1={position.source[0].position[1]} x2={position.target[0]} y2={position.target[1]} strokeWidth="1" stroke="grey" />
                )
            }) : null
          }
        </svg>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  notes: state.notes,
  boardId: state.singleWhiteboard.id
})

const mapDispatchToProps = { editNote, fetchNotes, deleteNote }

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Whiteboard));


/////
    // //In getBoundingClientREact:
    // //x - left most margin of element
    // //y- the bottom most margin of element
    // //bottom - distance from top to bottom most margin
    // componentDidMount() {
    //   this.props.fetchNotes(this.props.match.params.id)
    //   let data = document.getElementById('whiteboard').getBoundingClientRect();
    //   let eNoteWidth = 270;
    //   let eNoteHeight = 150;
    //   //this.positions = this.generatePositionsArray(data.height, data.width, eNoteHeight, eNoteWidth, data.left, data.top );
    //   this.positions = this.generatePositionsArray(4000, 4000, eNoteHeight, eNoteWidth, data.left, data.top);
    // }

    // // Returns a random integer between min (included) and max (excluded)
    //     // Using Math.round() will give you a non-uniform distribution!
    // getRandomInt(min, max) {
    //   return Math.floor(Math.random() * (max - min)) + min;
    // }

    // // generate random positions
    // generatePositionsArray(boardHeight, boardWidth, safeHeight, safeWidth, leftBegin, topBegin) {
    //   let irregularity = 0.5;
    //   // declarations
    //   var positionsArray = [];
    //   var r, c;
    //   var rows;
    //   var columns;
    //   // count the amount of rows and columns
    //   rows = Math.floor(boardHeight / safeHeight);
    //   columns = Math.floor(boardWidth / safeWidth);
    //   // loop through rows
    //   for (r = 1; r <= rows; r += 1) {
    //     // loop through columns
    //     for (c = 1; c <= columns; c += 1) {
    //       // populate array with point object
    //       positionsArray.push({
    //         x: Math.round(boardWidth * c / columns) + (this.getRandomInt(irregularity * -1, irregularity)) + (leftBegin / 4),
    //         y: Math.round(boardHeight * r / rows) + (this.getRandomInt(irregularity * -1, irregularity))
    //       });
    //     }
    //   }
    //   // return array
    //   return positionsArray;
    // }
    // // get random position from positions array
    // getRandomPosition(removeTaken) {
    //   // declarations
    //   var randomIndex;
    //   var coordinates;
    //   // get random index
    //   randomIndex = this.getRandomInt(0, this.positions.length - 1);
    //   // get random item from array
    //   coordinates = this.positions[randomIndex];
    //   // check if remove taken
    //   if (removeTaken) {
    //     // remove element from array
    //     this.positions = [...this.positions.slice(0, randomIndex), ...this.positions.slice(randomIndex + 1)]
    //   }
    //   // return position
    //   return coordinates;
    // }
    // // getRandomPosition(positions, true)
    // getPosition(noteId) {
    //   let pos = this.getRandomPosition(true);
    //   this.props.editNote(noteId, { position: [pos.x, pos.y] })
    //   return {
    //     style: {
    //       position: 'fixed',
    //       left: pos.x,    // computed based on child and parent's height
    //       top: pos.y   // computed based on child and parent's width
    //     }
    //   }
    // }

    // removePosition(takenPosition) {
    //   this.positions = this.positions.filter(aPosition =>
    //     (aPosition[0] != takenPosition[0]) && (aPosition[1] != takenPosition[1])
    //   )
    // }
  // //render method
  // data.map(note => {
  //   note.position && this.removePosition(note.position)
  // })