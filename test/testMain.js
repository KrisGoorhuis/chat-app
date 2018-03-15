import chai from 'chai';
//import { assert } from 'chai';
import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { shallow } from 'enzyme';



Enzyme.configure({ adapter: new Adapter() });

const expect = chai.expect;
const assert = chai.assert;

