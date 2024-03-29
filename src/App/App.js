import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AddFolder from '../AddFolder/AddFolder';
import AddNote from '../AddNote/AddNote';
import NoteListNav from '../NoteListNav/NoteListNav';
import NotePageNav from '../NotePageNav/NotePageNav';
import NoteListMain from '../NoteListMain/NoteListMain';
import NotePageMain from '../NotePageMain/NotePageMain';
import NotefulError from '../NotefulError';
import ApiContext from '../ApiContext';
import config from '../config';
import './App.css';
import PropTypes from 'prop-types';

class App extends Component {

    constructor(props) {
        super(props)

        this.state = {
            notes: [],
            folders: [],
        };

        // this.addFolder = this.addFolder.bind(this);
        // this.addNote = this.addNote.bind(this);
    }

    componentDidMount() {
        Promise.all([
            fetch(`${config.API_ENDPOINT}/notes`),
            fetch(`${config.API_ENDPOINT}/folders`)
        ])
            .then(([notesRes, foldersRes]) => {
                if (!notesRes.ok)
                    return notesRes.json().then(e => Promise.reject(e));
                if (!foldersRes.ok)
                    return foldersRes.json().then(e => Promise.reject(e));

                return Promise.all([notesRes.json(), foldersRes.json()]);
            })
            .then(([notes, folders]) => {
                this.setState({ notes, folders });
            })
            .catch(error => {
                console.error({ error });
            });
    }

    addFolder = (data) => {
        let newFolders = [...this.state.folders, data];
        this.setState({
            folders: newFolders
        })
    }

    addNote = (note) => {
        let newNotes = [...this.state.notes, note];
        this.setState({ notes: newNotes });
    }

    handleDeleteNote = noteId => {
        this.setState({
            notes: this.state.notes.filter(note => note.id !== noteId)
        });
    };

    renderNavRoutes() {
        return (
            <>
                {['/', '/folder/:folderId'].map(path => (
                    <Route
                        exact
                        key={path}
                        path={path}
                        component={NoteListNav}
                    />
                ))}
                <Route path="/note/:noteId" component={NotePageNav} />
                <Route path="/add-folder" component={NotePageNav} />
                <Route path="/add-note" component={NotePageNav} />
            </>
        );
    }

    renderMainRoutes() {
        return (
            <>
                {['/', '/folder/:folderId'].map(path => (
                    <Route
                        exact
                        key={path}
                        path={path}
                        component={NoteListMain}
                    />
                ))}
                <Route path="/note/:noteId" component={NotePageMain} />

                <Route path="/add-folder" render={() => (
                    <NotefulError>
                        <AddFolder />
                    </NotefulError>)}
                />

                <Route path="/add-note" render={() => (
                    <NotefulError>
                        <AddNote />
                    </NotefulError>)}
                />

            </>
        );
    }

    render() {
        const value = {
            notes: this.state.notes,
            folders: this.state.folders,
            deleteNote: this.handleDeleteNote,
            addFolder: this.addFolder,
            addNote: this.addNote
        };
        return (
            <ApiContext.Provider value={value}>
                <div className="App">
                    <nav className="App__nav">{this.renderNavRoutes()}</nav>
                    <header className="App__header">
                        <h1>
                            <Link to="/">Noteful</Link>{' '}
                            <FontAwesomeIcon icon="check-double" />
                        </h1>
                    </header>
                    <main className="App__main">{this.renderMainRoutes()}</main>
                </div>
            </ApiContext.Provider>
        );
    }
}

export default App;

ApiContext.Provider.propTypes = {
    value: PropTypes.shape({
        notes: PropTypes.array.isRequired,
        folders: PropTypes.array.isRequired,
        addFolder: PropTypes.func.isRequired,
        addNote: PropTypes.func.isRequired,
        deleteNote: PropTypes.func.isRequired,
    }).isRequired,
};