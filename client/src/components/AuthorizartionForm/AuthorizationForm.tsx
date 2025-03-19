import { useForm, SubmitHandler } from "react-hook-form";
import {useNavigate} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import style from "./AuthorizationForm.module.css";
import {AppDispatch, RootState} from "../../store/store.ts";
import {registerUser, resetPassword, userLogin} from "../../store/actionCreators/authActionCreators.ts";
import {LoginDataType, RegisterDataType, ResetDataType} from "../../store/types/authTypes.ts";

type FormInputs = {
    email?: string,
    usernameOrEmail?: string
    fullName?: string,
    username?: string,
    password: string
};

type AuthorizationFormProps = {
    type: string
}

export const AuthorizationForm = ({type}: AuthorizationFormProps) => {
    const {error} = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormInputs>();

    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        if (type === "register") {
            try {
                if(data.username && data.email && data.fullName) {
                    const dataRegister: RegisterDataType = {
                        username: data.username,
                        email: data.email,
                        password: data.password,
                        fullName: data.fullName,
                    }
                    const result = await dispatch(registerUser(dataRegister));
                    if (result.type !== "auth/registerUser/rejected") {

                        navigate('/login');
                    } else {
                        console.error('Login failed');
                    }
                }
            } catch (error) {
                console.error('Error during registering:', error);
            }
        } else if (type === "login") {
            try {
                if(data.usernameOrEmail) {
                    const dataLogin: LoginDataType = {
                        usernameOrEmail: data.usernameOrEmail,
                        password: data.password,
                    };
                    const result = await dispatch(userLogin(dataLogin));
                    if (result.type !== "auth/userLogin/rejected") {
                        // Only navigate if the login was successful
                        // await dispatch(fetchUser({username: result.payload.data.username}));
                        navigate('/');
                    } else {
                        console.error('Login failed');
                    }
                }
            } catch (error) {
                console.error('Error during login:', error);
            }
        } else if (type === "reset") {
            if(data.usernameOrEmail) {
                const dataReset: ResetDataType = {
                    usernameOrEmail: data.usernameOrEmail
                };
                dispatch(resetPassword(dataReset));

                navigate("/login");
            }
        }
    };

    let btnTitle;
    if (type === "register") {
        btnTitle = "Sign up"
    } else if (type === "login") {
        btnTitle = "Log in"
    } else if (type === "reset") {
        btnTitle = "Reset your password"
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className={`${style.formContainer} flex flex-col gap-1.5 text-[darkgray] w-full`}
        >
            {error && <p className="text-red-600 mt-3">{error}</p>}
            {type === "register" && (
                <>
                    <input {...register("email", {required: true})} placeholder="Email"/>
                    {errors.email && <span className={style.error}>Email is required</span>}
                    <input {...register("fullName",
                        {required: true, maxLength: 32})} placeholder="Full Name"/>
                    {errors.fullName && <span className={style.error}>Full name must be less than 32 characters</span>}
                    <input {...register("username",
                        {required: true, maxLength: 24})} placeholder="Userame"/>
                    {errors.username && <span className={style.error}>Username must be less that 24 characters</span>}
                </>
            )
            }
            {type !== "register" && (
                <>
                    <input {...register("usernameOrEmail", {required: true, maxLength: 24})}
                           placeholder="Username, or email"/>
                    {errors.usernameOrEmail &&
                        <span className={style.error}>Username or email must be less that 24 characters</span>}
                </>)}
            {type !== "reset" && (<>
                <input type="password" {...register("password",
                    {required: true, minLength: 8})} placeholder="Password"/>
                {errors.password && <span className={style.error}>Password must be more than 8 characters</span>}
            </>)}
            {type === "register" && (
                <>
                    <p className="text-xs mt-2.5 mb-4">
                        People who use our service may have uploaded your contact information to
                        Instagram. <a
                            className="text-darkblue cursor-pointer">Learn More</a></p>
                    <p className="text-xs mb-4">By signing up, you agree to our <a
                            className="text-darkblue cursor-pointer">Terms</a>, <a
                            className="text-darkblue cursor-pointer">Privacy
                            Policy</a> and <a className="text-darkblue cursor-pointer">Cookies Policy</a>.</p>
                </>
            )}
            <button className="mt-3.5" type="submit">{btnTitle}</button>
        </form>
    );
}