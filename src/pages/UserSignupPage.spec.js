import React from "react";
import {fireEvent, render, waitFor, waitForDomChange} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import UserSignupPage from "./UserSingupPage";


describe('UserSignupPage', () => {


    describe('Layout', () => {

        it('has header of Sign Up', () => {
            const {container} = render(<UserSignupPage/>);
            const header = container.querySelector('h1');
            expect(header).toHaveTextContent("Sign Up");
        });

        it('has input for display name', () => {
            const {queryByPlaceholderText} = render(<UserSignupPage/>);
            const displayNameInput = queryByPlaceholderText('Your display name');
            expect(displayNameInput).toBeInTheDocument();
        });

        it('has input for username', () => {
            const {queryByPlaceholderText} = render(<UserSignupPage/>);
            const usernameInput = queryByPlaceholderText('Your username');
            expect(usernameInput).toBeInTheDocument();
        });

        it('has input for password', () => {
            const {queryByPlaceholderText} = render(<UserSignupPage/>);
            const passwordInput = queryByPlaceholderText('Your password');
            expect(passwordInput).toBeInTheDocument();
        });

        it('has password type for the password input', () => {
            const {queryByPlaceholderText} = render(<UserSignupPage/>);
            const passwordInput = queryByPlaceholderText('Your password');
            expect(passwordInput.type).toBe('password');
        });

        it('has input for password repeat', () => {
            const {queryByPlaceholderText} = render(<UserSignupPage/>);
            const passwodRepeat = queryByPlaceholderText('Repeat your password');
            expect(passwodRepeat).toBeInTheDocument();
        });

        it('has password type for the Repeat password input', () => {
            const {queryByPlaceholderText} = render(<UserSignupPage/>);
            const passwodRepeat = queryByPlaceholderText('Repeat your password');
            expect(passwodRepeat.type).toBe('password');
        });

        it('has submit button', () => {
            const {container} = render(<UserSignupPage/>);
            const button = container.querySelector('button');
            expect(button).toBeInTheDocument();
        });
    });


    describe('Interactions', () => {
        const changeEvent = (content) => {
            return {
                target: {
                    value: content
                }
            }
        };

        const mockAsyncDelayed = () => {
            return jest.fn().mockImplementation(() => {
                return new Promise(((resolve, reject) => {
                    setTimeout(() => {
                        resolve({});
                    }, 300)
                }));
            });
        }

        let button, displayNameInput, usernameInput, passwordInput, passwordRepeat;

        const setupForSubmit = (props) => {
            const rendered = render(<UserSignupPage {...props}/>);

            const {container, queryByPlaceholderText} = rendered;
            displayNameInput = queryByPlaceholderText('Your display name');
            usernameInput = queryByPlaceholderText('Your username');
            passwordInput = queryByPlaceholderText('Your password');
            passwordRepeat = queryByPlaceholderText('Repeat your password');

            fireEvent.change(displayNameInput, changeEvent('my-display-name'));
            fireEvent.change(usernameInput, changeEvent('my-user-name'));
            fireEvent.change(passwordInput, changeEvent('P4ssword'));
            fireEvent.change(passwordRepeat, changeEvent('P4ssword'));

            button = container.querySelector('button');
            return rendered;
        }

        it('sets the displayName value into state', () => {
            const {queryByPlaceholderText} = render(<UserSignupPage/>);
            const displayNameInput = queryByPlaceholderText('Your display name');

            // coloca ese valor dentro del campo de texto
            fireEvent.change(displayNameInput, changeEvent('my-display-name'));

            // valida que el valor que cambio coincida
            expect(displayNameInput).toHaveValue('my-display-name');
        });


        it('sets the username value into state', () => {
            const {queryByPlaceholderText} = render(<UserSignupPage/>);
            const displayNameInput = queryByPlaceholderText('Your username');

            // coloca ese valor dentro del campo de texto
            fireEvent.change(displayNameInput, changeEvent('my-user-name'));

            // valida que el valor que cambio coincida
            expect(displayNameInput).toHaveValue('my-user-name');
        });


        it('sets the password value into state', () => {
            const {queryByPlaceholderText} = render(<UserSignupPage/>);
            const passwordInput = queryByPlaceholderText('Your password');

            // coloca ese valor dentro del campo de texto
            fireEvent.change(passwordInput, changeEvent('P4ssword'));

            // valida que el valor que cambio coincida
            expect(passwordInput).toHaveValue('P4ssword');
        });


        it('sets the password repeat value into state', () => {
            const {queryByPlaceholderText} = render(<UserSignupPage/>);
            const passwodRepeat = queryByPlaceholderText('Repeat your password');

            // coloca ese valor dentro del campo de texto
            fireEvent.change(passwodRepeat, changeEvent('P4ssword'));

            // valida que el valor que cambio coincida
            expect(passwodRepeat).toHaveValue('P4ssword');
        });


        it('calls postSignup when the fields are valid and the actions are provided in props', () => {
            const actions = {
                postSignup: jest.fn().mockResolvedValueOnce({})
            }

            setupForSubmit({actions});

            fireEvent.click(button);
            expect(actions.postSignup).toHaveBeenCalledTimes(1);
        });


        it('does not throw exception when clicking the button when actions not provided in props', () => {
            setupForSubmit();
            expect(() => fireEvent.click(button)).not.toThrow();
        });

        it('calls post with user body when the fields are valid', () => {
            const actions = {
                postSignup: jest.fn().mockResolvedValueOnce({})
            }

            setupForSubmit({actions});

            fireEvent.click(button);
            const expectedUserObject = {
                username: 'my-user-name',
                displayName: 'my-display-name',
                password: 'P4ssword'
            }
            expect(actions.postSignup).toHaveBeenLastCalledWith(expectedUserObject);
        });


        it('does not allow user to click the sign up button when there is an ongoing api call', () => {
            const actions = {
                postSignup: mockAsyncDelayed()
            }

            setupForSubmit({actions});

            fireEvent.click(button);
            fireEvent.click(button);
            expect(actions.postSignup).toHaveBeenCalledTimes(1)
        });


        it('display spinner when there is an ongoing api call', () => {
            const actions = {
                postSignup: mockAsyncDelayed()
            }

            const {queryByText} = setupForSubmit({actions});

            fireEvent.click(button);
            const spinner = queryByText('Loading...');
            expect(spinner).toBeInTheDocument();
        });


        it('hides spinner after api call finishes successfully', async () => {
            const actions = {
                postSignup: mockAsyncDelayed()
            }

            const {queryByText} = setupForSubmit({actions});

            fireEvent.click(button);

            await waitFor(() => expect(queryByText('Loading...')).not.toBeInTheDocument());
        });


        it('hides spinner after api call with error', async () => {
            const actions = {
                postSignup: jest.fn().mockImplementation(() => {
                    return new Promise(((resolve, reject) => {
                        setTimeout(() => {
                            reject({response: {data: {}}});
                        }, 300)
                    }));
                })
            }

            const {queryByText} = setupForSubmit({actions});

            fireEvent.click(button);

            await waitFor(() => expect(queryByText('Loading...')).not.toBeInTheDocument());
        });


        it('displays validation error for displayName when error is received for the field', async () => {
            const actions = {
                postSignup: jest.fn().mockRejectedValue({
                    response: {
                        data: {
                            validationErrors: {
                                displayName: 'Cannot be null'
                            }
                        }
                    }
                })
            }
            const {queryByText} = setupForSubmit({actions});
            fireEvent.click(button);

            await waitFor(() => expect(queryByText('Cannot be null')).toBeInTheDocument());
        });


        it('enables the signup button when password and repeat password have same value', () => {
            setupForSubmit();
            expect(button).not.toBeDisabled();
        });

        it('disables the signup button when password repeat does not match to password', () => {
            setupForSubmit();
            fireEvent.change(passwordRepeat, changeEvent('new-pass'));
            expect(button).toBeDisabled();
        });

        it('disables the signup button when password does not match to password repeat', () => {
            setupForSubmit();
            fireEvent.change(passwordInput, changeEvent('new-pass'));
            expect(button).toBeDisabled();
        });

        it('displays error style for password repeat input when password repeat mismatch', () => {
            const {queryByText} = setupForSubmit();
            fireEvent.change(passwordRepeat, changeEvent('new-pass'));
            const mismatchWarning = queryByText('Does not match to password');
            expect(mismatchWarning).toBeInTheDocument();
        });

        it('displays error style for password repeat input when password input mismatch', () => {
            const {queryByText} = setupForSubmit();
            fireEvent.change(passwordInput, changeEvent('new-pass'));
            const mismatchWarning = queryByText('Does not match to password');
            expect(mismatchWarning).toBeInTheDocument();
        });

        it('hides the validation error when user changes the content of displayName', async () => {
            const actions = {
                postSignup: jest.fn().mockRejectedValue({
                    response: {
                        data: {
                            validationErrors: {
                                displayName: 'Cannot be null'
                            }
                        }
                    }
                })
            }
            const {queryByText} = setupForSubmit({actions});
            fireEvent.click(button);

            await waitFor(() => expect(queryByText('Cannot be null')).not.toBeInTheDocument());
            fireEvent.change(displayNameInput, changeEvent('name updated'));
        });

        it('hides the validation error when user changes the content of username', async () => {
            const actions = {
                postSignup: jest.fn().mockRejectedValue({
                    response: {
                        data: {
                            validationErrors: {
                                displayName: 'Username cannot be null'
                            }
                        }
                    }
                })
            }
            const {queryByText} = setupForSubmit({actions});
            fireEvent.click(button);

            await waitFor(() => expect(queryByText('Username cannot be null')).not.toBeInTheDocument());
            fireEvent.change(usernameInput, changeEvent('name updated'));
        });

        it('hides the validation error when user changes the content of password', async () => {
            const actions = {
                postSignup: jest.fn().mockRejectedValue({
                    response: {
                        data: {
                            validationErrors: {
                                password: 'Cannot be null'
                            }
                        }
                    }
                })
            }
            const {queryByText} = setupForSubmit({actions});
            fireEvent.click(button);

            await waitFor(() => expect(queryByText('Cannot be null')).not.toBeInTheDocument());
            fireEvent.change(passwordInput, changeEvent('updated-password'));
        });
    });
});

console.error = () => {
}
