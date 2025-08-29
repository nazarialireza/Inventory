<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}" dir="{{ config('app.available_locales')[app()->getLocale()]['dir'] ?? 'ltr' }}">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ __('admin.auth.login_title') }}</title>
    <link rel="stylesheet" href="{{ asset('assets/css/bootstrap.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/app.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/auth-rtl.css') }}">
</head>

<body class="{{ config('app.available_locales')[app()->getLocale()]['dir'] === 'rtl' ? 'rtl' : '' }}">
    <div id="auth">

        <div class="container">
            <div class="row">
                <div class="col-md-6 col-sm-8 mx-auto">
                    @if ($login_error = Session::get('login-error'))
                        <div class="alert alert-danger color-info shadow">
                            {{ $login_error }}
                        </div>
                    @endif
                    <div class="pt-4">
                        <div class="card-body">
                            <div class="text-center mb-5">
                                <h3>{{ __('admin.auth.login_title') }}</h3>
                                <p>{{ __('admin.auth.login_subtitle') }}</p>
                            </div>
                            <form action="{{ route('login') }}" method="POST">
                                @csrf
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="form-group">
                                            <label for="email">{{ __('admin.auth.email') }}</label>
                                            @if ($errors->has('email'))
                                                <div class="text-danger my-1">{{ $errors->first('email') }}</div>
                                            @endif
                                            {{-- <input type="email" id="email" class="form-control"
                                                name="email" value="{{ @old('email')}}"> --}}
                                                <input type="email" id="email" class="form-control"
                                                name="email" value="superadmin@invextry.com">
                                        </div>
                                    </div>
                                    <div class="col-md-12">
                                        <div class="form-group">
                                            <label for="password">{{ __('admin.auth.password') }}</label>
                                            @if ($errors->has('password'))
                                                <div class="text-danger my-1">{{ $errors->first('password') }}</div>
                                            @endif
                                            {{-- <input type="password" id="email" class="form-control" name="password" 
                                            value="{{ @old('password')}}"> --}}
                                            <input type="password" id="email" class="form-control" name="password" 
                                            value="**invextry**">
                                        </div>
                                    </div>
                                </diV>

                                <div class="clearfix">
                                    <button class="btn btn-primary" type="submit">{{ __('admin.auth.signin') }}</button>
                                </div>
                            </form>
                            <div class="mt-3">
                                <a href="{{ route('registrationForm') }}">{{ __('admin.auth.no_account') }}</a>
                            </div>
                        
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
    
    <script src="{{ asset('assets/js/auth-language-switcher.js') }}"></script>
</body>

</html>