import * as type from "./constants"
import { api } from "./api"

const API = new api(35)

export const is_online = () => ({
  type: type.ONLINE
})

export const is_offline = () => ({
  type: type.OFFLINE
})

export const toggle_sidebar = () => ({
  type: type.TOGGLE_SIDEBAR
})

export const toggle_dark_mode = () => ({
  type: type.TOGGLE_DARK_MODE
})

export const on_load_start = () => ({
  type: type.ON_LOAD_START
})

export const on_play = () => ({
  type: type.ON_PLAY
})

export const on_pause = () => ({
  type: type.ON_PAUSE
})

export const toggle_repeat = () => ({
  type: type.TOGGLE_REPEAT
})

export const change_time = time => ({
  type: type.ON_TIME_UPDATE,
  time
})

export const change_volume = event => ({
  type: type.ON_VOLUME_CHANGE,
  volume: event.target.value
})

export const change_duration = duration => ({
  type: type.ON_LOADED_METADATA,
  duration
})

export const play_song = (songIndex, song) => async dispatch => {
  const audioUrl = await API.audioStream(song.stream)
  dispatch({ type: type.PLAY_SONG, songIndex, song, audioUrl })
}

export const play_song_from_btn = (index, route) => (dispatch, getState) => {
  let newPlaylist
  switch (route) {
    case "/":
      newPlaylist = getState().root.playlist
      break
    case "/search":
      newPlaylist = getState().search.results
      break
    case "/playlist":
      newPlaylist = getState().userPlaylist.playlist
      break
    default:
      return []
  }

  dispatch(play_song(index, newPlaylist[index]))
  dispatch({
    type: type.ACTIVE_PLAYLIST,
    currentPlaylist: newPlaylist,
    location: route
  })
}

export const play_next = () => (dispatch, getState) => {
  const { playlist, songIndex } = getState().playlist
  const nextSong = songIndex !== playlist.length - 1 ? songIndex + 1 : 0
  dispatch(play_song(nextSong, playlist[nextSong]))
}

export const play_prev = () => (dispatch, getState) => {
  const { playlist, songIndex } = getState().playlist
  const prevSong = songIndex !== 0 ? songIndex - 1 : playlist.length - 1
  dispatch(play_song(prevSong, playlist[prevSong]))
}

export const load_playlist = genre => async dispatch => {
  dispatch({ type: type.PLAYLIST_LOADING })

  const playlist = await API.load(genre)
  dispatch({ type: type.PLAYLIST_LOADED, playlist })
}

export const set_genre = genre => async dispatch => {
  dispatch({ type: type.PLAYLIST_LOADING })

  const playlist = await API.setGenre(genre)
  dispatch({ type: type.PLAYLIST_LOADED, playlist })
}

export const set_tag = tag => async dispatch => {
  dispatch({ type: type.PLAYLIST_LOADING })

  const playlist = await API.setTag(tag)
  dispatch({ type: type.PLAYLIST_LOADED, playlist })
}

export const set_filter = filter => async dispatch => {
  dispatch({ type: type.PLAYLIST_LOADING })

  const playlist = await API.setFilter(filter)
  dispatch({ type: type.PLAYLIST_LOADED, playlist })
}

export const load_playlist_next = () => async (dispatch, getState) => {
  const { loadingPlaylist } = getState().root

  if (!loadingPlaylist) {
    dispatch({ type: type.PLAYLIST_LOADING_NEXT })

    const playlist = await API.loadNext()
    dispatch({ type: type.PLAYLIST_LOADED, playlist })
  }
}

export const search_songs = q => async dispatch => {
  dispatch({ type: type.LOADING_SEARCH })

  const playlist = await API.search(q)
  dispatch({ type: type.LOADED_SEARCH, playlist })
}

export const load_next_results = () => async (dispatch, getState) => {
  const { loadingSearch } = getState().search

  if (!loadingSearch) {
    dispatch({ type: type.LOADING_SEARCH_NEXT })

    const playlist = await API.loadNext()
    dispatch({ type: type.LOADED_SEARCH, playlist })
  }
}

export const add_to_playlist = song => (dispatch, getState) => {
  const playlist = getState().userPlaylist.playlist
  const repeated = playlist.some(track => track.id === song.id)
  if (!repeated) {
    dispatch({ type: type.ADD_TO_PLAYLIST, song })
  }
}

export const remove_from_playlist = song => (dispatch, getState) => {
  let playlist = getState().userPlaylist.playlist.filter(
    track => track.id !== song.id
  )
  dispatch({ type: type.REMOVE_FROM_PLAYLIST, playlist })
}
