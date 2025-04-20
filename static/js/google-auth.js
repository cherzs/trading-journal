// Initialize Google Sign-In when the page loads
function initGoogleSignIn() {
    try {
        // Add debug logs
        console.log('Initializing Google Sign-In');
        
        // Check if meta tag exists
        const metaTag = document.querySelector('meta[name="google-signin-client_id"]');
        
        if (!metaTag) {
            console.error('Google Sign-In meta tag not found');
            return;
        }
        
        const clientId = metaTag.getAttribute('content');
        
        if (!clientId || clientId === '.apps.googleusercontent.com') {
            console.error('Invalid Google client ID: ' + clientId);
            return;
        }
        
        console.log('Google client ID found:', clientId);
        
        // Log the window.location for debugging redirect issues
        console.log('Current location:', window.location.href);
        console.log('Origin:', window.location.origin);
        
        gapi.load('auth2', function() {
            console.log('GAPI auth2 loaded');
            
            // Initialize the Google Sign-In API with better error handling
            gapi.auth2.init({
                client_id: clientId,
                scope: 'profile email',
                fetch_basic_profile: true,
                ux_mode: 'popup'
            }).then(
                function(auth2) {
                    console.log('Google Auth initialized successfully');
                    console.log('Auth instance:', auth2);
                    
                    // Attach sign out to logout links
                    attachSignOut();
                    
                    // Add listener for sign-in state changes
                    auth2.isSignedIn.listen(function(isSignedIn) {
                        console.log('Google Sign-In state changed:', isSignedIn);
                    });
                    
                    // Check if user is already signed in
                    if (auth2.isSignedIn.get()) {
                        console.log('User is already signed in with Google');
                        var user = auth2.currentUser.get();
                        console.log('Current user profile:', user.getBasicProfile());
                    }
                    
                    // Manually attach sign-in click handler
                    attachSignInHandler(auth2);
                },
                function(error) {
                    console.error('Google Auth initialization failed:', error);
                    console.error('Error details:', JSON.stringify(error, null, 2));
                    
                    // Display error to the user
                    const alertContainer = document.getElementById('alert-container');
                    if (alertContainer) {
                        alertContainer.innerHTML = `
                            <div class="bg-red-500 text-white px-4 py-3 rounded-md shadow-md mb-3">
                                <div class="flex">
                                    <div>
                                        <p class="font-bold">Google Sign-In Error</p>
                                        <p class="text-sm">Could not initialize Google authentication: ${error.error || error}</p>
                                    </div>
                                </div>
                            </div>
                        `;
                        
                        // Auto-remove alert after 8 seconds
                        setTimeout(function() {
                            alertContainer.innerHTML = '';
                        }, 8000);
                    }
                }
            );
        }, function(error) {
            console.error('Failed to load GAPI auth2:', error);
        });
    } catch (error) {
        console.error('Error in initGoogleSignIn:', error);
    }
}

// Attach click handler to the Google sign-in button
function attachSignInHandler(auth2) {
    try {
        // Find Google sign-in button that uses our redirect approach
        const googleButton = document.querySelector('a[href*="google_login"]');
        if (googleButton) {
            console.log('Found Google login button (redirect approach)');
            // This button already uses server-side redirect flow
        }
        
        // Optionally handle custom sign-in button
        const customGoogleButtons = document.querySelectorAll('.custom-google-signin');
        if (customGoogleButtons.length > 0) {
            console.log('Found custom Google sign-in buttons:', customGoogleButtons.length);
            customGoogleButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Custom Google sign-in button clicked');
                    auth2.signIn().then(
                        function(googleUser) {
                            console.log('Google sign-in successful via custom button');
                            onSignIn(googleUser);
                        },
                        function(error) {
                            console.error('Google sign-in failed via custom button:', error);
                        }
                    );
                });
            });
        }
    } catch (error) {
        console.error('Error in attachSignInHandler:', error);
    }
}

// Attach sign out functionality to all logout links
function attachSignOut() {
    try {
        var auth2 = gapi.auth2.getAuthInstance();
        document.querySelectorAll('a[href*="logout"]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                // Only invoke signOut if user is signed in with Google
                if (auth2.isSignedIn.get()) {
                    e.preventDefault();
                    console.log('Signing out from Google');
                    auth2.signOut().then(function() {
                        console.log('User signed out from Google.');
                        // After Google sign out, redirect to the logout route
                        window.location.href = link.getAttribute('href');
                    });
                } else {
                    console.log('User not signed in with Google, proceeding with normal logout');
                }
            });
        });
    } catch (error) {
        console.error('Error in attachSignOut:', error);
    }
}

// Add onload event
window.addEventListener('load', initGoogleSignIn); 