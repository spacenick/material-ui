const React = require('react/addons');
const PureRenderMixin = React.addons.PureRenderMixin;
const Transitions = require('./styles/transitions');
const Children = require('./utils/children');
const ColorManipulator = require('./utils/color-manipulator');
const ImmutabilityHelper = require('./utils/immutability-helper');
const Typography = require('./styles/typography');
const EnhancedButton = require('./enhanced-button');
const FlatButtonLabel = require('./buttons/flat-button-label');


function validateLabel (props, propName, componentName) {
  if (!props.children && !props.label) {
    return new Error('Required prop label or children was not ' +
      'specified in ' + componentName + '.');
  }
}

const FlatButton = React.createClass({

  mixins: [PureRenderMixin],

  contextTypes: {
    muiTheme: React.PropTypes.object,
  },

  propTypes: {
    disabled: React.PropTypes.bool,
    hoverColor: React.PropTypes.string,
    label: validateLabel,
    labelStyle: React.PropTypes.object,
    onKeyboardFocus: React.PropTypes.func,
    onMouseEnter: React.PropTypes.func,
    onMouseLeave: React.PropTypes.func,
    onTouchStart: React.PropTypes.func,
    primary: React.PropTypes.bool,
    rippleColor: React.PropTypes.string,
    secondary: React.PropTypes.bool,
  },

  getDefaultProps() {
    return {
      labelStyle: {},
      onKeyboardFocus: () => {},
      onMouseEnter: () => {},
      onMouseLeave: () => {},
      onTouchStart: () => {},
    };
  },

  getInitialState() {
    return {
      hovered: false,
      isKeyboardFocused: false,
      touch: false,
    };
  },

  getContextProps() {
    const theme = this.context.muiTheme;
    const buttonTheme = theme.component.button;
    const flatButtonTheme = theme.component.flatButton;

    return {
      buttonColor: flatButtonTheme.color,
      buttonHeight: buttonTheme.height,
      buttonMinWidth: buttonTheme.minWidth,
      disabledTextColor: flatButtonTheme.disabledTextColor,
      primaryTextColor: flatButtonTheme.primaryTextColor,
      secondaryTextColor: flatButtonTheme.secondaryTextColor,
      textColor: flatButtonTheme.textColor,
    };
  },

  render() {
    const {
      children,
      disabled,
      hoverColor,
      label,
      labelStyle,
      onKeyboardFocus,
      onMouseLeave,
      onMouseEnter,
      onTouchStart,
      primary,
      rippleColor,
      secondary,
      style,
      ...other,
      } = this.props;

    const contextProps = this.getContextProps();

    const defaultColor = disabled ? contextProps.disabledTextColor :
      primary ? contextProps.primaryTextColor :
      secondary ? contextProps.secondaryTextColor :
      contextProps.textColor;

    const defaultHoverColor = ColorManipulator.fade(ColorManipulator.lighten(defaultColor, 0.4), 0.15);
    const defaultRippleColor = ColorManipulator.fade(defaultColor, 0.8);
    const buttonHoverColor = hoverColor || defaultHoverColor;
    const buttonRippleColor = rippleColor || defaultRippleColor;
    const hovered = (this.state.hovered || this.state.isKeyboardFocused) && !disabled;

    const mergedRootStyles = ImmutabilityHelper.merge({
      color: defaultColor,
      transition: Transitions.easeOut(),
      fontSize: Typography.fontStyleButtonFontSize,
      letterSpacing: 0,
      textTransform: 'uppercase',
      fontWeight: Typography.fontWeightMedium,
      borderRadius: 2,
      userSelect: 'none',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: hovered ? buttonHoverColor : contextProps.buttonColor,
      lineHeight: contextProps.buttonHeight + 'px',
      minWidth: contextProps.buttonMinWidth,
      padding: 0,
      margin: 0,
      //This is need so that ripples do not bleed past border radius.
      //See: http://stackoverflow.com/questions/17298739
      transform: 'translate3d(0, 0, 0)',
    }, style);

    const labelElement = label ? (
      <FlatButtonLabel label={label} style={labelStyle} />
    ) : undefined;
    const enhancedButtonChildren = Children.create({
      labelElement,
      children,
    });

    return (
      <EnhancedButton
        {...other}
        disabled={disabled}
        focusRippleColor={buttonRippleColor}
        onKeyboardFocus={this._handleKeyboardFocus}
        onMouseLeave={this._handleMouseLeave}
        onMouseEnter={this._handleMouseEnter}
        onTouchStart={this._handleTouchStart}
        style={mergedRootStyles}
        touchRippleColor={buttonRippleColor}>
        {enhancedButtonChildren}
      </EnhancedButton>
    );
  },

  _handleKeyboardFocus(e, isKeyboardFocused) {
    this.setState({isKeyboardFocused: isKeyboardFocused});
    this.props.onKeyboardFocus(e, isKeyboardFocused);
  },

  _handleMouseEnter(e) {
    //Cancel hover styles for touch devices
    if (!this.state.touch) this.setState({hovered: true});
    this.props.onMouseEnter(e);
  },

  _handleMouseLeave(e) {
    this.setState({hovered: false});
    this.props.onMouseLeave(e);
  },

  _handleTouchStart(e) {
    this.setState({touch: true});
    this.props.onTouchStart(e);
  },

});

module.exports = FlatButton;
