import {combineReducers, configureStore} from '@reduxjs/toolkit';
import authReducer from "./slices/authSlice.ts";
import userReducer from "./slices/userSlice.ts";
import postReducer from "./slices/postSlice.ts";

const rootReducer = combineReducers({
    auth: authReducer,
    user: userReducer,
    post: postReducer,
});

const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;