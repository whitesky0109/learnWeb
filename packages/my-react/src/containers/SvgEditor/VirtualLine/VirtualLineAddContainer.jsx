/* eslint-disable react/no-unused-class-component-methods */
import PropTypes from 'prop-types';
import React from 'react';

import SvgEditorContainer from '../../SvgEditorContainer';

/** @extends {React.Component<Props>} */
class VirtualLineAddContainer extends React.Component {
  constructor(props) {
    super(props);
    const { instance } = props;

    /** @type {State} */
    this.state = {
      endStep: 1,
      step: 0,
      downPoint: null,
      arrowPoint: null,
      coordinates: [],
    };

    instance.setContainer(this);
  }

  componentWillUnmount() {
    const { instance: { unsetContainer } } = this.props;
    unsetContainer(this);
  }

  /** @param {SVGPoint | SVGPoint[]} point */
  setPoint = point => {
    const { step, coordinates: oldCoordinates } = this.state;

    let coordinates = [...oldCoordinates];
    if (Array.isArray(point)) {
      coordinates = point;
    } else {
      coordinates[step] = point;
    }

    /** @type {ArrowPoint} */
    let arrowPoint = null;
    if (coordinates.length === 2) {
      const { instance, minSize } = this.props;

      const [p1, p2] = coordinates;
      const { x, y } = instance.createPoint((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);

      const deg = Math.atan2(p1.y - p2.y, p1.x - p2.x) * 180 / Math.PI;
      const width = minSize;
      const height = minSize;
      arrowPoint = {
        gAttr: {
          transform: `translate(${x} ${y}) rotate(${deg})`
        },
        imageAttr: {
          href: null,
          x: -(width / 2),
          y: -(height / 2),
          width,
          height,
          // transform: `translate(-${width / 2} -${height / 2})`,
        }
      }
    }

    this.setState({ coordinates, arrowPoint });
  }

  drawEnd = () => {
    const { onChange, instance, endStep } = this.props;

    instance.onEnd();
    if (onChange) {
      const { coordinates } = this.state;
      onChange([...coordinates]);
    }

    this.setState({
      step: 0,
      endStep,
      downPoint: null,
      // coordinates: [],
      // arrowPoint: null,
    });
  };

  /**
   * @param {MouseEvent} event
   * @param {SVGPoint} downPoint
   */
  onMousedown = (event, point) => {
    const { downPoint } = this.state;

    if (!!downPoint === false) {
      this.setState({
        downPoint: point
      });
    }
  }

  /**
   * @param {MouseEvent} event
   * @param {SVGPoint} point
   */
  onMousemove = (event, point) => {
    const { step, downPoint } = this.state;

    if (step === 0) {
      const { minSize } = this.props;
      const diffX = point.x - downPoint.x;
      const diffY = point.y - downPoint.y;

      if (Math.abs(diffX) > minSize
        || Math.abs(diffY) > minSize
      ) {
        this.setState({ step: 1 })
        this.setPoint([downPoint, point]);
        return;
      }
    }

    this.setPoint(point);
  }

  /**
   * @param {MouseEvent} event
   * @param {SVGPoint} point
   */
  onMouseup = (event, point) => {
    this.setPoint(point);

    const { step, endStep } = this.state;
    const nextStep = step + 1;

    if (endStep <= nextStep) {
      this.drawEnd();
    } else {
      this.setState({ step: nextStep });
    }
  }

  /**
   * @param {PointerEvent} event
   * @param {SVGPoint} point
   */
  onClick = (event, point) => {
    this.onMouseup(event, point);
  }

  render() {
    const { render } = this.props;
    return render({
      ...this,
      ...this.state,
      ...this.props,
    })
  }
}

VirtualLineAddContainer.defaultProps = {
  onChange: null,

  // defaultProps
  minSize: 50,
  endStep: 2,
};

VirtualLineAddContainer.propTypes = {
  render: PropTypes.func.isRequired,
  onChange: PropTypes.func,

  // SvgEditorContainer
  instance: PropTypes.instanceOf(SvgEditorContainer).isRequired,

  minSize: PropTypes.number,
  endStep: PropTypes.number,
};

export default VirtualLineAddContainer;

/**
@typedef {{
  gAttr: React.SVGAttributes<SVGGElement>,
  imageAttr: React.SVGAttributes<SVGImageElement>
}} ArrowPoint

@typedef {{
  endStep: number,
  step: number,
  downPoint: SVGPoint,
  coordinates: SVGPoint[],
  arrowPoint?: ArrowPoint,
}} State

@typedef {{
  onChange: (coordinates: SVGPoint[]) => void,
  instance: SvgEditorContainer,
  
  minSize: number,
  endStep: number,
}} Props

@typedef {VirtualLineAddContainer & State & Props} RenderProps
*/
