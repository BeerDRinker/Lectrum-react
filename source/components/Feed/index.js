import React, { Component } from 'react';
import { Transition, CSSTransition, TransitionGroup } from 'react-transition-group';
import { fromTo } from 'gsap';

import StatusBar from '../StatusBar';
import Composer from '../Composer';
import Post from '../Post';
import Spinner from '../Spinner';
import Catcher from '../Catcher';
import Postman from '../Postman';
import Counter from '../Counter';

import Styles from './styles.m.css';
import { getUniqueID, delay } from '../../instruments';
import { api, TOKEN, GROUP_ID } from '../../config/api';
import { socket } from '../../socket/init';

class Feed extends Component {

  state = {
      posts:          [],
      isPostFetching: false,
  };

  componentDidMount () {
      const { currentUserFirstName, currentUserLastName } = this.props;

      this._fetchPosts();

      socket.emit('join', GROUP_ID);

      socket.on('create', (postJSON) => {
          const { data: createdPost, meta } = JSON.parse(postJSON);

          if (`${currentUserFirstName} ${currentUserLastName}` !== `${meta.authorFirstName} ${meta.authorLastName}`) {
              this.setState(({ posts }) => ({
                  posts: [createdPost, ...posts],
              }));
          }

      });

      socket.on('remove', (postJSON) => {
          const { data: removedPost, meta } = JSON.parse(postJSON);

          if (`${currentUserFirstName} ${currentUserLastName}` !== `${meta.authorFirstName} ${meta.authorLastName}`) {
              this.setState(({ posts }) => ({
                  posts: posts.filetr((post) => post.id !== removedPost.id),
              }));
          }

      });

      socket.on('like', (postJSON) => {
          const { data: likedPost, meta } = JSON.parse(postJSON);

          if (`${currentUserFirstName} ${currentUserLastName}` !== `${meta.authorFirstName} ${meta.authorLastName}`) {
              this.setState(({ posts }) => ({
                  posts: posts.map(
                      (post) => post.id === likedPost.id ? likedPost : post,
                  ),
                  isPostFetching: false,
              }));
          }

      });
  }

  componentWillUnmount () {
      socket.removeListener('create');
      socket.removeListener('remove');
      socket.removeListener('like');
  }

  _setPostFetchingState = (state) => {
      this.setState({
          isPostFetching: state,
      });
  }

  _fetchPosts = async () => {
      this._setPostFetchingState(true);

      const response = await fetch(api, {
          method: 'GET',
      });

      const { data: posts } = await response.json();

      this.setState({
          posts,
          isPostFetching: false,
      });
  };

  _createPost = async (comment) => {
      this._setPostFetchingState(true);

      const response = await fetch(api, {
          method:  'POST',
          headers: {
              'Content-Type': 'application/json',
              Authorization:  TOKEN,
          },
          body: JSON.stringify({ comment }),
      });

      const { data: post } = await response.json();

      this.setState(({ posts }) => ({
          posts:          [post, ...posts],
          isPostFetching: false,
      }));
  }

  _likePost = async (id) => {
      this._setPostFetchingState(true);

      const response = await fetch(`${api}/${id}`, {
          method:  'PUT',
          headers: {
              Authorization: TOKEN,
          },
      });

      const { data: likedPost } = await response.json();

      this.setState(({ posts }) => ({
          posts: posts.map(
              (post) => post.id === likedPost.id ? likedPost : post,
          ),
          isPostFetching: false,
      }));
  }

  _removePost = async (id) => {
      this._setPostFetchingState(true);

      await fetch(`${api}/${id}`, {
          method:  'DELETE',
          headers: {
              Authorization: TOKEN,
          },
      });

      this.setState(({ posts }) => ({
          posts:          posts.filter((post) => post.id !== id),
          isPostFetching: false,
      }));
  }

  _animateComposerEnter = (composer) => {
      fromTo(
          composer,
          1,
          { opacity: 0, rotationX: 50 },
          { opacity: 1, rotationX: 0 });
  }

  _animatePostManEnter = (postman) => {
      fromTo(postman, 2, { x: 500 }, { x: 0 });
  }

  _animatePostManExit = (postman) => {
      fromTo(postman, 2, { x: 0 }, { x: 500 });
  }

  render () {

      const { posts, isPostFetching } = this.state;

      const postJSX = posts.map((post) => {
          return (
              <CSSTransition
                  classNames = { {
                      enter:       Styles.postInStart,
                      enterActive: Styles.postInEnd,
                      exit:        Styles.postOutStart,
                      exitActive:  Styles.postOutEnd,
                  } }
                  key = { post.id }
                  timeout = { {
                      enter: 500,
                      exit:  400,
                  } }>
                  <Catcher>
                      <Post
                          { ...post }
                          _likePost = { this._likePost }
                          _removePost = { this._removePost }
                      />
                  </Catcher>
              </CSSTransition>
          );
      });

      return (
          <section className = { Styles.feed }>
              <Spinner isSpinning = { isPostFetching } />
              <StatusBar />
              <Transition
                  appear
                  in
                  timeout = { 0 }
                  onEntered = { this._animateComposerEnter }>
                  <Composer _createPost = { this._createPost } />
              </Transition>
              <Transition
                  appear
                  exit
                  in
                  timeout = { 4000 }
                  onEntered = { this._animatePostManExit }
                  onEntering = { this._animatePostManEnter }>
                  <Postman />
              </Transition>
              <Counter count = { postJSX.length } />
              <TransitionGroup>
                  { postJSX }
              </TransitionGroup>
          </section>
      );
  }
}

export default Feed;
