export const onCreate = (state, { socket }) => state
    .setIn(['sync', 'socket'], socket);

export const onError = (state, err) => state
    .setIn(['sync', 'error'], err);

export const onUpdateFromLocal = (state, { req }) => state
    .setIn(['sync', 'local'], req);

export const onPushFromRemote = (state, { res }) => state
    .setIn(['sync', 'remote'], state.getIn(['sync', 'remote'])
        .mergeDeep(res)
    );

