import {
	map
}                         from "lodash";
import $                  from "jquery";
import {
	Map,
	List,
	Set
}                         from "immutable";
import React              from "react";
import PropTypes          from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { Link }           from "react-router";
import { connect }        from "react-redux";
import { push }           from "react-router-redux";
import moment             from "moment";
import {
	changeIssueSearchParamters,
	searchIssues
}                         from "project/scripts/redux/actions";
import IssueRecord        from "project/scripts/records/issue";
import CATEGORY_ICON_MAP  from "project/scripts/utils/category-icon-map";
import Categories         from "project/shared-lib/categories";
import                         "project/styles/search.less";


class IssueSearch extends React.Component {
	static propTypes = {
		"search": ImmutablePropTypes.map,
		"searchResults": ImmutablePropTypes.listOf(
			PropTypes.instanceOf(IssueRecord)
		),
		"initialSearch": PropTypes.object,
		"dispatch": PropTypes.func.isRequired
	}

	componentWillMount() {
		if (this.props.initialSearch) {
			this.props.dispatch(changeIssueSearchParamters(this.props.initialSearch));
			this.performSearch({ "search": this.props.initialSearch });
		}
	}

	componentDidMount() {
		if (this.props.search && !this.props.search.isEmpty()) {
			this.performSearch();
		}
	}

	performSearch({ pushState, search } = {}) {
		if (!search && this.props.search) {
			search = this.props.search.toJS();
		}

		if (pushState) {
			this.props.dispatch(push(`/issues/search?${this.$form.serialize()}`));
		}

		this.props.dispatch(searchIssues({ "searchOptions": search }));
	}

	changeParameter = (name, value) => {
		this.props.dispatch(changeIssueSearchParamters({[name]: value}));
	}

	handleFormSubmit(event) {
		event.preventDefault();

		this.performSearch({
			"pushState": true
		});
	}

	render() {
		return (
			<div className="issues-search-container">
				<form
					action="/issues/search"
					method="get"
					encType="application/x-www-form-urlencoded"
					onSubmit={event => this.handleFormSubmit(event)}
					ref={form => this.$form = $(form)}
				>
					<div
						className="form-group"
					>
						<label
							htmlFor="search-query"
						>Search query: </label>
						<input
							type="search"
							name="query"
							id="search-query"
							className="form-control"
							value={this.props.search.get("query") || ""}
							onChange={event => this.changeParameter("query", event.target.value)}
						/>
					</div>
					<div
						className="form-group"
					>
						<label
							htmlFor="search-category"
						>
							Category: 
						</label>
						<select
							id="search-category"
							name="category"
							value={
								Set.of(this.props.search.get("category", Set())).toJS()
							}
							onChange={event => this.changeParameter(
								"category",
								Array.from(event.target.selectedOptions).map(opt => opt.value))
							}
							multiple
						>
							{
								map(
									Categories,
									(category, categoryID) => (
										<option
											key={categoryID}
											value={categoryID}
										>{category.name}</option>
									)
								)
							}
						</select>
					</div>

					<div
						className="form-group"
					>
						<button
							type="submit"
							className="btn btn-primary"
						>Search</button>
					</div>
				</form>
				<div>
					{
						this.props.searchResults.isEmpty() ?
							"" :
							(<h3>Results</h3>)
					}
					<ul className="search-results">
						<li
							className="result-header-row"
						>
							<div
								className="result-field"
							>Name</div>
							<div
								className="result-field"
							>Deadline</div>
						</li>
						{
							this.props.searchResults.map(
								result => (
									<li
										key={result.id}
										className="result-row"
									>
										<div
											className="result-field"
										>
											<Link
												className={`fa fa-${CATEGORY_ICON_MAP[result.category]}`}
												to={`/issues/${result.id}`}
											>
												{result.name}
											</Link>
										</div>
										<div
											className="result-field"
										>{
											result.deadline &&
												moment(result.deadline).format("MM/DD/YYYY")
										}</div>
									</li>
								)
							).toArray()
						}
					</ul>
				</div>
			</div>
		);
	}
}

export default connect(
	(state, ownProps) => {
		const issues = state.get("issues", Map());
		const issueSearch = issues.get("search", Map());
		const resultIDs = issueSearch.get("results");
		const searchParameters = issueSearch.get("parameters");

		const searchResults = resultIDs && !resultIDs.isEmpty() ?
			issues.get("items").toList().filter(
				issue => resultIDs.includes(issue.id)
			).sort(
				(a, b) => {
					let aDeadline = a.deadline;
					let bDeadline = b.deadline;

					aDeadline = aDeadline ? aDeadline.getTime() : Number.MAX_SAFE_INTEGER;
					bDeadline = bDeadline ? bDeadline.getTime() : Number.MAX_SAFE_INTEGER;

					return aDeadline - bDeadline;
				}
			) :
			List();

		const search = searchParameters || Map();
		const props = {
			search,
			searchResults
		};

		if (ownProps.search && !searchParameters) {
			props.initialSearch = ownProps.search;
		}

		return props;
	}
)(IssueSearch);
