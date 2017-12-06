import { connect } from 'react-redux';

import React from 'react';

export function Body() {
    return <div className="chatterbox-body">
    </div>;
}

Body.propTypes = {
};

export default connect()(Body);

