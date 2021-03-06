import React from 'react';

import Styles from './styles.m.css';
import { withProfile } from '../HOC/withProfile';

const Postman = (props) => {
    return (
        <section className = { Styles.postman }>
            <img src = { props.avatra } />
            <span>Welcome online, {props.currentUserFirstName}</span>
        </section>
    );
};

export default withProfile(Postman);
