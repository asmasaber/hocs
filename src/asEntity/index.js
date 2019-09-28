import { Component } from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import get from 'lodash/get';

import EntityActions from 'Redux/Actions/Entity';

class EntityComponent extends Component {
  get storeId() {
    const { storeId } = this.props;

    return storeId;
  }

  get store() {
    const { entityStore } = this.props;

    return get(entityStore, `byId.${this.storeId}`, null);
  }

  register() {
    this.props.register(this.storeId);
  }

  get(data) {
    this.props.get(this.storeId, data);
  }

  post(data) {
    this.props.post(this.storeId, data);
  }

  reset() {
    this.props.reset(this.storeId);
  }

  resetProp(prop) {
    this.props.resetProp(this.storeId, prop);
  }

  resetResponseProps() {
    this.props.resetResponseProps(this.resetProp);
  }

  componentDidMount() {
    if (this.storeId && !this.store) {
      this.props.register(this.storeId);
    }

    // Set the ref
    this.props.entityRef(this);
  }

  componentDidUpdate() {
    const {
      received,
      posted,
      errors,
      responseFromGet,
      responseFromPost
    } = this.store;

    if (received && !errors) {
      this.props.onEntityReceived(responseFromGet);
      this.props.resetProp(this.storeId, 'received');
    }

    if (posted && !errors) {
      this.props.onEntityPosted(responseFromPost);
      this.props.resetProp(this.storeId, 'posted');
    }

    if (received && errors) {
      this.props.onEntityReceivedError(errors);
      this.props.resetProp(this.storeId, 'received');
    }

    if (posted && errors) {
      this.props.onEntityPostedError(errors);
      this.props.resetProp(this.storeId, 'posted');
    }
  }

  componentWillUnmount() {
    const { storeId } = this.props;

    if (storeId && this.store) {
      this.props.resetProp(storeId, 'loading');
    }
  }

  render() {
    const { storeId, render } = this.props;

    if (storeId && this.store) {
      return render(this.store) || null;
    }

    return null;
  }
}

EntityComponent.propTypes = {
  className: PropTypes.string,
  loading: PropTypes.bool,
  storeId: PropTypes.string.isRequired,

  entityStore: PropTypes.object,

  entityRef: PropTypes.func,
  onEntityReceived: PropTypes.func,
  onEntityPosted: PropTypes.func,
  onEntityReceivedError: PropTypes.func,
  onEntityPostedError: PropTypes.func,

  render: PropTypes.func,

  register: PropTypes.func,
  get: PropTypes.func,
  post: PropTypes.func,

  reset: PropTypes.func,
  resetProp: PropTypes.func,
  resetResponseProps: PropTypes.func
};

EntityComponent.defaultProps = {
  storeId: null,
  render() {},
  entityRef() {},
  onEntityReceived() {},
  onEntityPosted() {},
  onEntityPostedError() {},
  onEntityReceivedError() {}
};

const mapStateToProps = store => ({
  entityStore: store.entity
});

const mapDispatchToProps = dispatch => ({
  register: id => dispatch(EntityActions.register(id)),
  get: (id, data) => dispatch(EntityActions.get(id, data)),
  post: (id, data) => dispatch(EntityActions.post(id, data)),
  reset: id => dispatch(EntityActions.reset(id)),
  resetProp: (id, prop) => dispatch(EntityActions.resetProp(id, prop)),
  resetResponseProps: id => dispatch(EntityActions.resetResponseProps(id))
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(EntityComponent);